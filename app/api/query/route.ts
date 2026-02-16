import { NextRequest, NextResponse } from "next/server";
import { novaClient } from "@/lib/nova/client";
import {
    getImageFormat,
    isImageFile,
    bufferToBase64,
} from "@/lib/utils/file-processor";

export async function POST(request: NextRequest) {
    try {
        const { fileUrl, question } = await request.json();

        if (!fileUrl || !question) {
            return NextResponse.json(
                { error: "Missing file URL or question" },
                { status: 400 }
            );
        }

        const startTime = Date.now();

        // Fetch file
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error("Failed to fetch file");
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const base64 = bufferToBase64(fileBuffer);
        const contentType = fileResponse.headers.get("content-type") || "";
        const urlPath = new URL(fileUrl).pathname;
        const filename = urlPath.split("/").pop() || "file";

        if (!isImageFile(filename) && !contentType.startsWith("image/")) {
            return NextResponse.json(
                { error: "Q&A currently supports images. Document Q&A coming in Release 2." },
                { status: 400 }
            );
        }

        const format = getImageFormat(filename);
        const result = await novaClient.answerQuestion(base64, question, format);
        const processingTimeMs = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            qa: {
                question,
                answer: result.text,
                model: "Nova 2 Lite",
                processingTimeMs,
                tokensUsed: result.usage,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error: unknown) {
        console.error("Q&A error:", error);
        const message = error instanceof Error ? error.message : "Q&A failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
