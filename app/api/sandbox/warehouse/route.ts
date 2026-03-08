import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services/warehouse-service";
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
        apiLog = createApiLog(request, "/api/sandbox/warehouse:GET", guard.principal);

        const isAllowed = await rateLimiter.check(20, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const searchParams = request.nextUrl.searchParams;
        const sku = searchParams.get("sku");

        if (sku) {
            const item = await warehouseService.getItem(sku);
            apiLog.end(200);
            return NextResponse.json(item || { error: "Item not found" });
        } else {
            const items = await warehouseService.getAllItems();
            apiLog.end(200, { itemsCount: items.length });
            return NextResponse.json({ items });
        }
    } catch (error: unknown) {
        console.error("Warehouse API Error:", error);
        apiLog?.end(500);
        return NextResponse.json({ error: "Failed to fetch warehouse data" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const demoOnly = enforceDemoMode();
        if (demoOnly) return demoOnly;
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/sandbox/warehouse:PATCH", guard.principal);

        const isAllowed = await rateLimiter.check(10, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await request.json();
        const { sku, quantityChange } = body;

        if (!sku || typeof quantityChange !== "number") {
            apiLog.end(400);
            return NextResponse.json({ error: "Missing sku or quantityChange" }, { status: 400 });
        }

        const updatedItem = await warehouseService.updateStock(sku, quantityChange);
        apiLog.end(200);
        return NextResponse.json(updatedItem);
    } catch (error: unknown) {
        console.error("Warehouse API Error:", error);
        apiLog?.end(500);
        return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    let apiLog: ReturnType<typeof createApiLog> | null = null;
    try {
        const demoOnly = enforceDemoMode();
        if (demoOnly) return demoOnly;
        const guard = guardApiRequest(request);
        if (!guard.ok) return guard.response;
        apiLog = createApiLog(request, "/api/sandbox/warehouse:POST", guard.principal);

        const isAllowed = await rateLimiter.check(2, getRateLimitKey(request));
        if (!isAllowed) {
            apiLog.end(429);
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await request.json();
        if (body.action === "seed") {
            await warehouseService.seedData();
            apiLog.end(200, { action: "seed" });
            return NextResponse.json({ success: true, message: "Warehouse seeded with demo data" });
        }
        apiLog.end(400);
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: unknown) {
        console.error("Warehouse API Error:", error);
        apiLog?.end(500);
        return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
    }
}
