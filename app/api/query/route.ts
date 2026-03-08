import { NextRequest, NextResponse } from "next/server";
import { novaClient } from "@/lib/nova/client";
import {
    getImageFormat,
    isImageFile,
    bufferToBase64,
} from "@/lib/utils/file-processor";
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
        apiLog = createApiLog(request, "/api/query", guard.principal);

        const isAllowed = await rateLimiter.check(20, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { fileUrl, question } = await request.json();

        if (!fileUrl || !question) {
            apiLog.end(400);
            return NextResponse.json(
                { error: "Missing file URL or question" },
                { status: 400 }
            );
        }

        const startTime = Date.now();
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

        if (!isImageFile(filename) && !contentType.startsWith("image/")) {
            apiLog.end(400);
            return NextResponse.json(
                { error: "Q&A currently supports images. Document Q&A coming in Release 2." },
                { status: 400 }
            );
        }

        const format = getImageFormat(filename);
        const result = await novaClient.answerQuestion(base64, question, format);
        const processingTimeMs = Date.now() - startTime;

        apiLog.end(200, { processingTimeMs });
        return NextResponse.json({
            success: true,
            qa: {
                question,
                answer: result.text,
                model: "Nova 2 Lite",
                processingTimeMs,
                tokensUsed: result.usage,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error: unknown) {
        console.error("Q&A error:", error);
        const message = error instanceof Error ? error.message : "Q&A failed";
        apiLog?.end(500);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
