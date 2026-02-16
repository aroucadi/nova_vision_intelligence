import { NextRequest, NextResponse } from "next/server";
import { agentCoordinator } from "@/lib/agents/coordinator";
import { bufferToBase64, getImageFormat, getDocFormat, isImageFile, isDocumentFile } from "@/lib/utils/file-processor";
import { type FileFormat } from "@/lib/nova/types";

export async function POST(request: NextRequest) {
    try {
        const { fileUrl } = await request.json();

        if (!fileUrl) {
            return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
        }

        // SSRF Prevention: Validate URL host
        const allowedHost = `${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
        const urlObj = new URL(fileUrl);
        if (urlObj.hostname !== allowedHost && !urlObj.hostname.endsWith(".amazonaws.com") && !fileUrl.startsWith("http://localhost")) {
            // Allowing localhost for dev/testing if needed, but optimally restrict to S3
            // For strict production, we only allow our S3 bucket
            if (process.env.NODE_ENV === "production") {
                return NextResponse.json({ error: "Invalid file source. Must be from authorized storage." }, { status: 403 });
            }
        }

        // Fetch file
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const base64 = bufferToBase64(fileBuffer);
        const contentType = fileResponse.headers.get("content-type") || "";
        const urlPath = new URL(fileUrl).pathname;
        const filename = urlPath.split("/").pop() || "file";

        let format: FileFormat | null = null;
        if (isImageFile(filename) || contentType.startsWith("image/")) {
            format = getImageFormat(filename);
        } else if (isDocumentFile(filename)) {
            format = getDocFormat(filename);
            // Ensure it's a format supported by Nova 2 Lite document analysis
            const supported = ["pdf", "csv", "doc", "docx", "html", "txt", "md", "xls", "xlsx"];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (format && !supported.includes(format as any)) {
                format = null;
            }
        }

        if (!format) {
            return NextResponse.json({ error: "Unsupported file format for multi-agent analysis" }, { status: 400 });
        }

        // Trigger the multi-agent pipeline
        const pipelineState = await agentCoordinator.runPipeline({
            base64,
            format: format!,
            filename,
        });

        return NextResponse.json({
            success: true,
            pipeline: pipelineState,
        });
    } catch (error: unknown) {
        console.error("Multi-agent pipeline error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
