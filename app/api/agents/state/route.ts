import { NextRequest, NextResponse } from "next/server";
import { guardApiRequest } from "@/lib/security/api-guard";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { getPipelineStateManager } from "@/lib/agents/state";
import { createApiLog } from "@/lib/observability/api-log";

export async function GET(request: NextRequest) {
  let apiLog: ReturnType<typeof createApiLog> | null = null;
  try {
    const guard = guardApiRequest(request);
    if (!guard.ok) return guard.response;
    apiLog = createApiLog(request, "/api/agents/state", guard.principal);

    const isAllowed = await rateLimiter.check(60, getRateLimitKey(request));
    if (!isAllowed) {
      apiLog.end(429);
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const pipelineId = request.nextUrl.searchParams.get("pipelineId");
    if (!pipelineId) {
      apiLog.end(400);
      return NextResponse.json({ error: "Missing pipelineId" }, { status: 400 });
    }

    const pipeline = await getPipelineStateManager().getState(pipelineId);
    if (!pipeline) {
      apiLog.end(404);
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    apiLog.end(200);
    return NextResponse.json({ success: true, pipeline });
  } catch (e: unknown) {
    apiLog?.end(500);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
