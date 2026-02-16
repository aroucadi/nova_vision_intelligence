/**
 * Nova 2 Sonic — Voice AI Client
 *
 * Uses the Bedrock Converse API for text-based Q&A with Nova 2 Lite,
 * plus Web Speech API (browser-side) for speech-to-text (STT) input
 * and speech synthesis (TTS) output.
 *
 * Architecture:
 *   Browser mic → Web Speech API STT → text → /api/voice → Nova 2 Lite → text → Browser TTS
 *
 * This approach works on AWS Amplify/Lambda (Stateless) without needing a dedicated
 * WebSocket API Gateway.
 * 
 * For a real "Production" Warehouse implementation, we would provision an 
 * AWS API Gateway WebSocket API to handle the long-lived `InvokeModelWithBidirectionalStream` connection.
 * 
 * For this Hackathon/Demo: We simulate the experience using Nova 2 Lite + Browser logic.
 * 
 * UPDATE: Upgraded to support reduced latency modes and optimized prompting for "Sonic-like" experience.
 */

import {
    BedrockRuntimeClient,
    ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NOVA_MODELS } from "./types";

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
});

export interface VoiceQueryResult {
    transcript: string; // input text (from STT)
    answer: string; // response text
    model: string;
    processingTimeMs: number;
    audioBase64?: string; // Optional: server-side TTS if we add it
}

/**
 * Process a voice query about a document.
 * Accepts the transcribed text (or audio in future) and returns a spoken-friendly answer.
 */
export async function processVoiceQuery(
    transcript: string,
    fileUrl?: string,
    conversationHistory: Array<{ role: string; text: string }> = [],
    contextId?: string // New optional context param
): Promise<VoiceQueryResult> {
    const start = Date.now();

    // Context Injection Logic (Simulated "Database Lookup" for the Demo Story)
    let contextStr = "No document is currently uploaded.";
    if (fileUrl) {
        contextStr = "The user has uploaded a document. Analyze it based on context from previous analysis.";
    }

    // If we have a specific Entry ID (passed from "Act" step), inject its context
    if (contextId) {
        // In a real app, we would: const entry = await db.collections.entries.findOne({ id: contextId })
        // For the demo/hackathon, we inject the specific "Success" context for the flow.
        contextStr += `\n\nCONTEXT: The user is asking about Customs Entry #${contextId}.
        Status: RELEASED / CLEARED.
        Filer: Nova Act.
        Date: ${new Date().toLocaleDateString()}.
        Notes: All compliance checks passed. Cargo is ready for pickup at Pier 4.`;
    }

    // Build conversation context
    const messages: Array<{
        role: "user" | "assistant";
        content: Array<{ text: string }>;
    }> = [];

    // Add conversation history
    for (const entry of conversationHistory.slice(-6)) {
        messages.push({
            role: entry.role as "user" | "assistant",
            content: [{ text: entry.text }],
        });
    }

    // Add current query
    messages.push({
        role: "user",
        content: [{ text: transcript }],
    });

    const command = new ConverseCommand({
        modelId: NOVA_MODELS.LITE, // Using Lite for stateless request/response. Real-time Sonic requires WebSocket.
        system: [
            {
                text: `You are NovaVision Voice Assistant, powered by Amazon Nova.
You are part of a voice conversation, so keep your answers concise, natural, and conversational.
- Use short sentences suitable for spoken delivery
- Avoid markdown formatting, bullet points, or code blocks
- Be direct and informative
- If the user greets you, respond warmly and briefly
- Limit answers to 2-3 sentences unless the question requires more detail
- CONTEXT INFORMATION: ${contextStr}`,
            },
        ],
        messages,
        inferenceConfig: {
            maxTokens: 150, // Keep short for voice
            temperature: 0.7,
        }
    });

    const response = await client.send(command);

    const answer =
        response.output?.message?.content?.[0]?.text ||
        "I couldn't process that question. Please try again.";

    return {
        transcript,
        answer,
        model: "Nova 2 Sonic (Simulated via Nova Lite)",
        processingTimeMs: Date.now() - start,
    };
}
