import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services/warehouse-service";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sku = searchParams.get("sku");

        if (sku) {
            const item = await warehouseService.getItem(sku);
            return NextResponse.json(item || { error: "Item not found" });
        } else {
            const items = await warehouseService.getAllItems();
            return NextResponse.json({ items });
        }
    } catch (error: unknown) {
        console.error("Warehouse API Error:", error);
        return NextResponse.json({ error: "Failed to fetch warehouse data" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { sku, quantityChange } = body;

        if (!sku || typeof quantityChange !== "number") {
            return NextResponse.json({ error: "Missing sku or quantityChange" }, { status: 400 });
        }

        const updatedItem = await warehouseService.updateStock(sku, quantityChange);
        return NextResponse.json(updatedItem);
    } catch (error: unknown) {
        console.error("Warehouse API Error:", error);
        return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (body.action === "seed") {
            await warehouseService.seedData();
            return NextResponse.json({ success: true, message: "Warehouse seeded with demo data" });
        }
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: unknown) {
        console.error("Warehouse API Error:", error);
        return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
    }
}
