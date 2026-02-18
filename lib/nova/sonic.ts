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
import { registry } from "@/lib/agents/registry";
import { pathwayContext } from "@/lib/context/global-pathway";
import { claimsAgent } from "@/lib/agents/claims";

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
    contextId?: string, // New optional context param
    audioBase64?: string // New: Real Audio Input
): Promise<VoiceQueryResult> {
    const start = Date.now();

    // Context Injection Logic (Simulated "Database Lookup" for the Demo Story)
    let contextStr = "No document is currently uploaded.";
    if (fileUrl) {
        contextStr = "The user has uploaded a document. Analyze it based on context from previous analysis.";
    }

    // If we have a specific Entry ID (passed from "Act" step), inject its context
    if (contextId) {
        // REAL LOOKUP: Check our simulated "Customs DB"
        const entry = await registry.getEntry(contextId);

        // GLOBAL PATHWAY: Check for proactive alerts (The "Black Hole" fix)
        const pathway = await pathwayContext.getContext(contextId);

        if (entry) {
            contextStr += `\n\nCONTEXT: The user is asking about Customs Entry #${entry.entryNumber}.
            Current Status: ${entry.status} (Verified in Registry).
            Filer Code: ${entry.filerCode}.
            Import Date: ${entry.timestamp}.
            Items: ${entry.items.map(i => `${i.quantity || 1}x ${i.description}`).join(", ")}.
            Total Duty: $${entry.totalDuty.toFixed(2)}.`;

            // Inject Pathway Alerts
            if (pathway && pathway.alerts.length > 0) {
                contextStr += `\n\n⚠️ IMPORTANT ALERTS (Notify User Immediately):
                 ${pathway.alerts.map(a => `- ${a}`).join("\n")}`;
            }

            contextStr += `\n\n${entry.status === "RELEASED"
                ? "ACTIONABLE: The goods are released. You can authorize the warehouse team to dispatch the trucks."
                : "ACTIONABLE: The goods are NOT yet released. Do not dispatch."}`;
        } else {
            // Fallback if ID is provided but not found (e.g. from a fresh restart without persistence)
            contextStr += `\n\nCONTEXT: The user is asking about Customs Entry #${contextId}, but it was not found in the active registry. 
            It might be a legacy entry or the system was restarted. Advising user to re-file or check the ID.`;
        }
    }

    // === WRITE ACTION: Discrepancy Reporting ===
    // Simple intent detection for the demo (Regex-based is faster than an extra LLM hop)
    // Looking for: "I count X units" or "We only received X"
    const discrepancyMatch = transcript.match(/count\s+(\d+)|received\s+(\d+)|only\s+(\d+)/i);
    if (contextId && discrepancyMatch) {
        const observedCount = parseInt(discrepancyMatch[1] || discrepancyMatch[2] || discrepancyMatch[3]);

        // REAL LOOKUP: Get expected count from the registry entry
        const entry = await registry.getEntry(contextId);
        const firstItem = entry?.items?.[0];
        const expectedCount = firstItem?.quantity || 100;
        const itemName = firstItem?.description || "Units";

        if (observedCount < expectedCount) {
            console.log(`[Sonic] Discrepancy Detected: Observed ${observedCount}, Expected ${expectedCount}`);

            // 1. Update Global Context Status
            const discrepancy = { expected: expectedCount, actual: observedCount, item: "Units", reportedAt: new Date().toISOString() };
            await pathwayContext.reportDiscrepancy(contextId, discrepancy);

            // 2. Trigger Real Claims Agent (Zero Mock)
            // Fetch the registry data to get vendor info
            const entry = await registry.getEntry(contextId);
            const invoiceData = entry ? {
                invoice_number: entry.entryNumber,
                vendor: { name: entry.vendor || "Unknown" },
                vendor_email: "claims-dept@vendor.com", // Fallback if not in registry yet
            } : {};

            const claimDraft = await claimsAgent.draftClaim(contextId, discrepancy, invoiceData as any);

            // 3. Persist the Draft and Vendor Email
            await pathwayContext.reportClaim(contextId, claimDraft, invoiceData.vendor_email || "");

            // 4. Override standard Nova response
            return {
                transcript: audioBase64 ? "[Audio Input]" : transcript,
                answer: `I've logged the discrepancy. You counted ${observedCount}, but the manifest expects ${expectedCount}. The system has already drafted a formal shortage claim to ${invoiceData.vendor || 'the vendor'}. It is ready for review in the dashboard.`,
                model: "Nova 2 Pro (Agentic Action)",
                processingTimeMs: Date.now() - start,
            };
        }
    }

    // Build conversation context
    // We use the shared type to allow audio/video/text blocks
    const messages: any[] = [];

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
        modelId: NOVA_MODELS.LITE,
        messages,
        inferenceConfig: {
            maxTokens: 150,
            temperature: 0.7,
        },
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
    });

    // If audio input is provided, we construct a multimodal message
    if (audioBase64) {
        // Remove the text-only message added above
        messages.pop();

        // Add multimodal message with Audio
        messages.push({
            role: "user",
            content: [
                {
                    text: "Please answer this voice query from a warehouse operator:"
                },
                {
                    audio: {
                        format: "webm", // AudioRecorder produces webm
                        source: {
                            bytes: audioBase64
                        }
                    }
                }
            ]
        });

        // Force Nova Pro for Audio
        command.input.modelId = NOVA_MODELS.PRO;
    }

    try {
        const response = await client.send(command);

        const answer =
            response.output?.message?.content?.[0]?.text ||
            "I couldn't process that question. Please try again.";

        return {
            transcript: audioBase64 ? "[Audio Input]" : transcript,
            answer,
            model: audioBase64 ? "Nova 2 Pro (Multimodal Audio)" : "Nova 2 Lite (Text)",
            processingTimeMs: Date.now() - start,
        };
    } catch (error) {
        console.error("Nova Sonic Error:", error);
        return {
            transcript,
            answer: "Sorry, I'm having trouble connecting to Nova right now.",
            model: "Error",
            processingTimeMs: Date.now() - start,
        };
    }
}
