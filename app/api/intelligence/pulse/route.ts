import { NextResponse } from "next/server";
import { pulseAgent } from "@/lib/agents/pulse-agent";

export async function GET() {
    try {
        console.log("[API] Intelligence Pulse: Triggering real-world analysis...");
        const pulses = await pulseAgent.fetchAndAnalyze();

        return NextResponse.json({
            success: true,
            pulses,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("[API] Failed to fetch intelligence pulse:", error);
        return NextResponse.json({
            success: false,
            error: "Resource fetch failed"
        }, { status: 500 });
    }
}
