import { NextRequest, NextResponse } from "next/server";
import { guardApiRequest } from "@/lib/security/api-guard";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { createApiLog } from "@/lib/observability/api-log";

export async function GET(request: NextRequest) {
    const guard = guardApiRequest(request);
    if (!guard.ok) return guard.response;
    const apiLog = createApiLog(request, "/api/act/types", guard.principal);

    const isAllowed = await rateLimiter.check(60, getRateLimitKey(request));
    if (!isAllowed) {
        apiLog.end(429);
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Return static workflow types directly (Ported from legacy python service)
    apiLog.end(200);
    return NextResponse.json({
        types: [
            {
                id: "data_collection",
                name: "Web Data Collection",
                description: "Extract structured data from any website — pricing, reviews, product listings.",
                icon: "Database",
                example_url: "https://example.com/products",
            },
            {
                id: "form_fill",
                name: "Smart Form Filler",
                description: "Auto-fill web forms using data extracted from your uploaded documents.",
                icon: "FileInput",
                example_url: "https://example.com/apply",
            },
            {
                id: "qa_test",
                name: "QA Testing",
                description: "Automated quality assurance — check page load, UI elements, accessibility, links.",
                icon: "ShieldCheck",
                example_url: "https://example.com",
            },
        ],
    });
}
