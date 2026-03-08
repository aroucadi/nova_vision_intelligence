import { NextRequest, NextResponse } from "next/server";
import { kbService } from "@/lib/services/kb-service";
import { guardApiRequest } from "@/lib/security/api-guard";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { createApiLog } from "@/lib/observability/api-log";

export async function POST(req: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const guard = guardApiRequest(req);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(req, "/api/rag/sync", guard.principal);

        const isAllowed = await rateLimiter.check(2, getRateLimitKey(req));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { action } = await req.json();

        if (action === "sync") {
            console.log("[API] Triggering Bedrock Knowledge Base Sync...");
            const jobId = await kbService.sync();
            apiLog.end(200);
            return NextResponse.json({
                success: true,
                message: "RAG Ingestion Job started",
                jobId
            });
        }

        apiLog.end(400);
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("[API] RAG Sync Error:", error);
        apiLog?.end(500);
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to trigger sync"
        }, { status: 500 });
    }
}
