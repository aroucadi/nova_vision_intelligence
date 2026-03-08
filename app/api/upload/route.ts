import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { vectorStore } from "@/lib/vector-store";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { guardApiRequest } from "@/lib/security/api-guard";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { createApiLog } from "@/lib/observability/api-log";

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
});


export async function POST(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/upload", guard.principal);

        const isAllowed = await rateLimiter.check(10, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            apiLog.end(400);
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            apiLog.end(400);
            return NextResponse.json(
                { error: "File too large (max 10MB)" },
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            apiLog.end(400);
            return NextResponse.json(
                { error: `Unsupported file type: ${file.type}` },
                { status: 400 }
            );
        }

        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
        if (!bucketName) {
            console.error("Missing NEXT_PUBLIC_S3_BUCKET_NAME env var");
            apiLog?.end(500);
            return NextResponse.json({ error: "Server misconfiguration: No Storage Bucket" }, { status: 500 });
        }

        // Generate unique filename
        const fileId = nanoid(10);
        const ext = file.name.split(".").pop();
        const filename = `${fileId}.${ext}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to S3
        const objectKey = `uploads/${filename}`;
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            Body: buffer,
            ContentType: file.type,
        }));

        const fileUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({ Bucket: bucketName, Key: objectKey }),
            { expiresIn: 60 * 60 }
        );

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

        apiLog?.end(200, { fileType: file.type, fileSize: file.size });
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
        apiLog?.end(500);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
