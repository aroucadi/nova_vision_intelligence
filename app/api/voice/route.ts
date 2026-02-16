import { NextRequest, NextResponse } from "next/server";
import { processVoiceQuery } from "@/lib/nova/sonic";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transcript, fileUrl, conversationHistory, contextId } = body;

        if (!transcript || typeof transcript !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid transcript" },
                { status: 400 }
            );
        }

        const result = await processVoiceQuery(
            transcript,
            fileUrl,
            conversationHistory || [],
            contextId
        );

        return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
        console.error("Voice API error:", error);
        const message = error instanceof Error ? error.message : "Voice processing failed";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
