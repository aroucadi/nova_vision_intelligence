import { NextRequest, NextResponse } from "next/server";
import { processVoiceQuery } from "@/lib/nova/sonic";
import { guardApiRequest } from "@/lib/security/api-guard";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { createApiLog } from "@/lib/observability/api-log";

export async function POST(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/voice", guard.principal);

        const isAllowed = await rateLimiter.check(10, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        let transcript = "";
        let fileUrl = undefined;
        let conversationHistory = [];
        let contextId = undefined;
        let audioBase64 = undefined;

        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const audioFile = formData.get("audio") as File;

            if (audioFile) {
                const arrayBuffer = await audioFile.arrayBuffer();
                audioBase64 = Buffer.from(arrayBuffer).toString("base64");
            }

            transcript = (formData.get("transcript") as string) || "";
            fileUrl = (formData.get("fileUrl") as string) || undefined;
            contextId = (formData.get("contextId") as string) || undefined;

            const historyStr = formData.get("conversationHistory") as string;
            if (historyStr) {
                try {
                    conversationHistory = JSON.parse(historyStr);
                } catch (e) {
                    console.warn("Failed to parse conversation history", e);
                }
            }

        } else {
            // Fallback to JSON (Text-only mode)
            const body = await request.json();
            transcript = body.transcript;
            fileUrl = body.fileUrl;
            conversationHistory = body.conversationHistory;
            contextId = body.contextId;
        }

        if ((!transcript && !audioBase64)) {
            apiLog.end(400);
            return NextResponse.json(
                { error: "Missing input (audio or transcript)" },
                { status: 400 }
            );
        }

        const result = await processVoiceQuery(
            transcript || "Audio Input",
            fileUrl,
            conversationHistory || [],
            contextId,
            audioBase64
        );

        apiLog.end(200);
        return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
        console.error("Voice API error:", error);
        const message = error instanceof Error ? error.message : "Voice processing failed";
        apiLog?.end(500);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
