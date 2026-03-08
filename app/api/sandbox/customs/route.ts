import { NextRequest, NextResponse } from "next/server";
import { customsService } from "@/lib/services/customs-service";
import { enforceDemoMode, guardApiRequest } from "@/lib/security/api-guard";
import { rateLimiter } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/security/rate-limit-key";
import { createApiLog } from "@/lib/observability/api-log";

export async function GET(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const demoOnly = enforceDemoMode();
        if (demoOnly) return demoOnly;
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/sandbox/customs:GET", guard.principal);

        const isAllowed = await rateLimiter.check(20, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (id) {
            const entry = await customsService.getEntry(id);
            if (!entry) {
                apiLog.end(404);
                return NextResponse.json({ error: "Entry not found" }, { status: 404 });
            }
            apiLog.end(200);
            return NextResponse.json(entry);
        } else {
            const entries = await customsService.getAllEntries();
            apiLog.end(200, { entriesCount: entries.length });
            return NextResponse.json({ entries });
        }
    } catch (error: unknown) {
        console.error("Customs API Error:", error);
        apiLog?.end(500);
        return NextResponse.json({ error: "Failed to fetch customs data" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const demoOnly = enforceDemoMode();
        if (demoOnly) return demoOnly;
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/sandbox/customs:POST", guard.principal);

        const isAllowed = await rateLimiter.check(5, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await request.json();

        // Handle Seeding
        if (body.action === "seed") {
            await customsService.seedData();
            apiLog.end(200, { action: "seed" });
            return NextResponse.json({ success: true, message: "Customs Registry seeded with demo data" });
        }

        // Handle Filing (Standard)
        const newEntry = await customsService.fileEntry(body);
        apiLog.end(200, { action: "fileEntry" });
        return NextResponse.json(newEntry);
    } catch (error: unknown) {
        console.error("Customs API Error:", error);
        apiLog?.end(500);
        return NextResponse.json({ error: "Failed to file entry" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const demoOnly = enforceDemoMode();
        if (demoOnly) return demoOnly;
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/sandbox/customs:PATCH", guard.principal);

        const isAllowed = await rateLimiter.check(5, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await request.json();
        const { entryNumber, status } = body;

        if (!entryNumber || !status) {
            apiLog.end(400);
            return NextResponse.json({ error: "Missing entryNumber or status" }, { status: 400 });
        }

        await customsService.updateStatus(entryNumber, status);
        apiLog.end(200);
        return NextResponse.json({ success: true, entryNumber, status });
    } catch (error: unknown) {
        console.error("Customs API Error:", error);
        apiLog?.end(500);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
