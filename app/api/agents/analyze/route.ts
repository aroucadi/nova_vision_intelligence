import { NextRequest, NextResponse } from "next/server";
import { agentCoordinator } from "@/lib/agents/coordinator";
import { bufferToBase64, getImageFormat, getDocFormat, isImageFile, isDocumentFile } from "@/lib/utils/file-processor";
import { type FileFormat } from "@/lib/nova/types";
import { guardApiRequest } from "@/lib/security/api-guard";
import { fetchArrayBufferWithLimits } from "@/lib/security/safe-fetch";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { createApiLog } from "@/lib/observability/api-log";

export async function POST(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/agents/analyze", guard.principal);

        const isAllowed = await rateLimiter.check(5, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { fileUrl } = await request.json();

        if (!fileUrl) {
            apiLog.end(400);
            return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
        }

        const fetchRes = await fetchArrayBufferWithLimits(fileUrl, {
            maxBytes: 15 * 1024 * 1024,
            timeoutMs: 15000
        });
        if (!fetchRes.ok) {
            apiLog.end(fetchRes.response.status);
            return fetchRes.response;
        }

        const fileBuffer = fetchRes.bytes;
        const base64 = bufferToBase64(fileBuffer);
        const contentType = fetchRes.contentType || "";
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
            apiLog.end(400);
            return NextResponse.json({ error: "Unsupported file format for multi-agent analysis" }, { status: 400 });
        }

        // Trigger the multi-agent pipeline
        const pipelineState = await agentCoordinator.runPipeline({
            base64,
            format: format!,
            filename,
            requestId: apiLog.requestId,
        });

        apiLog.end(200);
        return NextResponse.json({
            success: true,
            pipeline: pipelineState,
        });
    } catch (error: unknown) {
        console.error("Multi-agent pipeline error:", error);
        apiLog?.end(500);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
