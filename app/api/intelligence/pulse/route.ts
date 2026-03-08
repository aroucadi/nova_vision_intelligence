import { NextRequest, NextResponse } from "next/server";
import { pulseAgent } from "@/lib/agents/pulse-agent";
import { guardApiRequest } from "@/lib/security/api-guard";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { createApiLog } from "@/lib/observability/api-log";

export async function GET(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/intelligence/pulse", guard.principal);

        const isAllowed = await rateLimiter.check(5, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        console.log("[API] Intelligence Pulse: Triggering real-world analysis...");
        const pulses = await pulseAgent.fetchAndAnalyze();

        apiLog.end(200, { pulsesCount: pulses.length });
        return NextResponse.json({
            success: true,
            pulses,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("[API] Failed to fetch intelligence pulse:", error);
        apiLog?.end(500);
        return NextResponse.json({
            success: false,
            error: "Resource fetch failed"
        }, { status: 500 });
    }
}
