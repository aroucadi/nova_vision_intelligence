import { NextRequest, NextResponse } from "next/server";
import { processVoiceQuery } from "@/lib/nova/sonic";

export async function POST(request: NextRequest) {
    try {
        let transcript = "";
        let fileUrl = undefined;
        let conversationHistory = [];
        let contextId = undefined;
        let audioBase64 = undefined;

        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const audioFile = formData.get("audio") as File;

            if (audioFile) {
                const arrayBuffer = await audioFile.arrayBuffer();
                audioBase64 = Buffer.from(arrayBuffer).toString("base64");
            }

            transcript = (formData.get("transcript") as string) || "";
            fileUrl = (formData.get("fileUrl") as string) || undefined;
            contextId = (formData.get("contextId") as string) || undefined;

            const historyStr = formData.get("conversationHistory") as string;
            if (historyStr) {
                try {
                    conversationHistory = JSON.parse(historyStr);
                } catch (e) {
                    console.warn("Failed to parse conversation history", e);
                }
            }

        } else {
            // Fallback to JSON (Text-only mode)
            const body = await request.json();
            transcript = body.transcript;
            fileUrl = body.fileUrl;
            conversationHistory = body.conversationHistory;
            contextId = body.contextId;
        }

        if ((!transcript && !audioBase64)) {
            return NextResponse.json(
                { error: "Missing input (audio or transcript)" },
                { status: 400 }
            );
        }

        const result = await processVoiceQuery(
            transcript || "Audio Input",
            fileUrl,
            conversationHistory || [],
            contextId,
            audioBase64
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
