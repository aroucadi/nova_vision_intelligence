import { NextResponse } from "next/server";
import { kbService } from "@/lib/services/kb-service";

export async function POST(req: Request) {
    try {
        const { action } = await req.json();

        if (action === "sync") {
            console.log("[API] Triggering Bedrock Knowledge Base Sync...");
            const jobId = await kbService.sync();
            return NextResponse.json({
                success: true,
                message: "RAG Ingestion Job started",
                jobId
            });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("[API] RAG Sync Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to trigger sync"
        }, { status: 500 });
    }
}
