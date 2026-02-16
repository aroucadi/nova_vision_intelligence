import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { vectorStore } from "@/lib/vector-store";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/csv",
    "text/plain",
    "text/html",
    "text/markdown",
];

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large (max 10MB)" },
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Unsupported file type: ${file.type}` },
                { status: 400 }
            );
        }

        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
        if (!bucketName) {
            console.error("Missing NEXT_PUBLIC_S3_BUCKET_NAME env var");
            return NextResponse.json({ error: "Server misconfiguration: No Storage Bucket" }, { status: 500 });
        }

        // Generate unique filename
        const fileId = nanoid(10);
        const ext = file.name.split(".").pop();
        const filename = `${fileId}.${ext}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: `uploads/${filename}`,
            Body: buffer,
            ContentType: file.type,
        }));

        // Construct S3 URL (Public or Presigned - assuming public read for demo simplicity or proxy access)
        // For strict security, we'd use GetObjectCommand with getSignedUrl
        const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/uploads/${filename}`;

        // Indexing Logic (Simple RAG)
        try {
            // For text-based files, we index the content
            const textTypes = ["text/csv", "text/plain", "text/html", "text/markdown"];
            let contentToIndex = `File: ${file.name} (Type: ${file.type})`;

            if (textTypes.includes(file.type)) {
                const textContent = new TextDecoder().decode(bytes);
                // Truncate if too long for this simple store
                contentToIndex += `\n\nContent:\n${textContent.substring(0, 8000)}`;
            } else {
                contentToIndex += `\n\n(Binary file - content not indexed in this demo, only metadata)`;
            }

            await vectorStore.addDocument(contentToIndex, {
                filename: file.name,
                fileId,
                url: fileUrl,
                type: file.type,
                uploadedAt: new Date().toISOString()
            });
            console.log(`Indexed file: ${file.name}`);

        } catch (indexError) {
            console.error("Failed to index file:", indexError);
            // Don't fail the upload just because indexing failed
        }

        return NextResponse.json({
            success: true,
            file: {
                id: fileId,
                filename: file.name,
                mimeType: file.type,
                size: file.size,
                url: fileUrl,
                uploadedAt: new Date().toISOString(),
            },
        });
    } catch (error: unknown) {
        console.error("Upload error:", error);
        const message =
            error instanceof Error ? error.message : "Upload failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
