import { NextResponse } from "next/server";
import { registry } from "@/lib/agents/registry";

export async function GET() {
    try {
        const entries = registry.getAllEntries();
        return NextResponse.json({
            success: true,
            entries
        });
    } catch (error) {
        console.error("Registry API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch entries" }, { status: 500 });
    }
}
