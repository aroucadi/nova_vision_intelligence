import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/agents/registry";
import { guardApiRequest } from "@/lib/security/api-guard";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { createApiLog } from "@/lib/observability/api-log";

export async function GET(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/act/registry", guard.principal);

        const isAllowed = await rateLimiter.check(20, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const entries = await registry.getAllEntries();
        apiLog.end(200, { entriesCount: entries.length });
        return NextResponse.json({
            success: true,
            entries
        });
    } catch (error) {
        console.error("Registry API Error:", error);
        apiLog?.end(500);
        return NextResponse.json({ success: false, error: "Failed to fetch entries" }, { status: 500 });
    }
}
