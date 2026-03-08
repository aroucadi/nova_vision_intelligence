import { novaClient } from "../nova/client";
import { PROMPTS } from "../nova/prompts";
import { type AgentResponse } from "./types";
import { type ImageFormat, type FileFormat, type DocumentFormat } from "../nova/types";
import { novaEmbeddings } from "../nova/embeddings";
import { extractionDataSchema } from "./contracts";
import { getRetriever } from "@/lib/retrieval";

import { learningService } from "../services/learning-service";

export abstract class BaseAgent {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly description: string;

    // Level 3: Learning Support
    protected async injectLearnings(topic: string, currentPrompt: string): Promise<string> {
        const learnings = await learningService.retrieveLearnings(topic);
        if (learnings.length === 0) return currentPrompt;

        return `${currentPrompt}

<historical_learnings>
The following rules were learned from previous sessions. Apply them strictly:
${learnings.map(l => `- ${l}`).join("\n")}
</historical_learnings>`;
    }

    abstract run(context: { base64: string; format: FileFormat; filename: string;[key: string]: unknown }): Promise<AgentResponse>;

    protected async callNova(prompt: string, base64: string, format: FileFormat, filename: string = "file"): Promise<AgentResponse> {
        try {
            let result;
            if (["jpeg", "png", "gif", "webp"].includes(format)) {
                result = await novaClient.analyzeImage(base64, prompt, format as ImageFormat);
            } else {
                result = await novaClient.analyzeDocument(base64, filename, format as DocumentFormat, prompt);
            }

            return {
                success: true,
                data: result.text,
                usage: result.usage,
            };
        } catch (error: any) {
            console.error(`[BaseAgent] Nova API call failed for ${this.id}:`, error.message || error);
            return {
                success: false,
                error: `Service Unavailable: ${error.message || "Unknown error"}`,
                data: "",
                usage: { inputTokens: 0, outputTokens: 0 },
            };
        }
    }
}

export class AnalyzerAgent extends BaseAgent {
    readonly id = "analyzer";
    readonly name = "Logistics Analyst";
    readonly description = "Specialized in shipping documents, incoterms, and shipment summaries";

    async run(context: { base64: string; format: FileFormat; filename: string; extractionData?: unknown }): Promise<AgentResponse> {
        let prompt = PROMPTS.summary as string;

        // Level 3: Learning Search
        const vendor = (context.extractionData as ExtractionData)?.vendor?.name || "general";
        prompt = await this.injectLearnings(vendor, prompt);

        // Context Injection: If we have structured data, feed it to the Analyst
        if (context.extractionData) {
            prompt += `\n\n<context_injection>
The following structured data was already extracted from this document by the Perception Agent. 
Use it to ensure your summary is factually consistent with these values.
${JSON.stringify(context.extractionData, null, 2)}
</context_injection>`;
        }

        return this.callNova(prompt, context.base64, context.format, context.filename);
    }
}

export class ExtractorAgent extends BaseAgent {
    readonly id = "extractor";
    readonly name = "Customs Broker";
    readonly description = "Extracts commercial invoice data, line items, and weights for clearing";

    async run(context: { base64: string; format: FileFormat; filename: string; schema?: Record<string, unknown> }): Promise<AgentResponse> {
        try {
            const schema = context.schema || {
                invoice_number: { type: "string" },
                invoice_date: { type: "string" },
                vendor: { type: "object", properties: { name: { type: "string" }, address: { type: "string" } } },
                buyer: { type: "object", properties: { name: { type: "string" }, address: { type: "string" } } },
                total_amount: { type: "number" },
                currency: { type: "string" },
                line_items: { type: "array", items: { type: "object", properties: { description: { type: "string" }, hs_code: { type: "string" }, value: { type: "number" } } } }
            };

            let result;
            // High-Accuracy Path: Always use structured extraction if possible, or rigorous JSON prompting
            if (["jpeg", "png", "gif", "webp"].includes(context.format)) {
                // Nova Structued Extraction (Vision) works best for images
                result = await novaClient.extractStructured(context.base64, schema, context.format as ImageFormat);
            } else {
                // For documents, we use Nova Pro for reasoning-based extraction with strict JSON enforcement
                let prompt = `${PROMPTS.extraction}
                
                CRITICAL: You must return ONLY valid JSON. No markdown formatting, no comments, no preambles.
                Ensure all numbers are numbers, not strings. Usage of this data will fail if JSON is invalid.`;

                // Level 3: Learning Search (Fallback path)
                prompt = await this.injectLearnings(context.filename, prompt);

                const response = await novaClient.analyzeDocument(context.base64, context.filename, context.format as DocumentFormat, prompt);
                const text = response.text.trim();

                // Robust JSON Cleanup
                const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
                try {
                    result = JSON.parse(cleanJson);
                } catch (e) {
                    console.error("JSON Parse failed, attempting repair", e);
                    // Minimal repair: find first { and last }
                    const firstBrace = text.indexOf("{");
                    const lastBrace = text.lastIndexOf("}");
                    if (firstBrace !== -1 && lastBrace !== -1) {
                        result = JSON.parse(text.substring(firstBrace, lastBrace + 1));
                    } else {
                        throw new Error("Nova Pro failed to generate valid JSON");
                    }
                }
            }

            const parsed = extractionDataSchema.safeParse(result);
            if (!parsed.success) {
                return {
                    success: false,
                    error: "Extraction output validation failed",
                    data: null,
                    usage: { inputTokens: 0, outputTokens: 0 },
                };
            }

            return {
                success: true,
                data: parsed.data,
                usage: { inputTokens: 0, outputTokens: 0 },
            };
        } catch (error: any) {
            console.error("[ExtractorAgent] Nova Extraction critical failure:", error.message || error);
            return {
                success: false,
                error: `Extraction Failed: ${error.message || "Invalid document format or API error"}`,
                data: null,
                usage: { inputTokens: 0, outputTokens: 0 }
            };
        }
    }
}

import { pathwayContext } from "@/lib/context/global-pathway";

export class ComplianceAgent extends BaseAgent {
    readonly id = "compliance";
    readonly name = "Trade Compliance Officer";
    readonly description = "Checks against sanctions lists, hazardous materials, and export controls";

    async run(context: { base64: string; format: FileFormat; filename: string; extractionData?: ExtractionData }): Promise<AgentResponse> {
        let prompt = PROMPTS.compliance as string;

        // Context Injection: Feed extracted entities to the Compliance Officer
        if (context.extractionData) {
            // RAG LOOKUP: Check for historical risks related to the vendor/item
            const vendor = context.extractionData.vendor?.name || "";
            const items = context.extractionData.line_items?.map(i => i.description).join(", ") || "";
            const history = await getRetriever().search(`compliance risk for ${vendor} related to ${items}`, 1);

            prompt += `\n\n<context_injection>
AUDIT TARGETS (Extracted Data):
${JSON.stringify(context.extractionData, null, 2)}

HISTORICAL RAG CONTEXT: 
${history.length > 0 ? history[0].metadata.content : "No historical risk found for this vendor/item."}

INSTRUCTION: 
1. Specificially audit the "vendor" against Sanctions Lists.
2. Check the "line_items" descriptions for HazMat risks.
3. Incorporate the HISTORICAL RAG CONTEXT into your risk determination.
</context_injection>`;
        }

        // Level 3: Learning Search
        const topic = context.extractionData?.vendor?.name || "compliance";
        prompt = await this.injectLearnings(topic, prompt);

        const response = await this.callNova(prompt, context.base64, context.format, context.filename);

        // PROACTIVE NOTIFICATION LOGIC
        if (context.extractionData?.invoice_number) {
            const shipmentId = context.extractionData.invoice_number;
            const text = response.data as string;

            // Analyze the agent's risk determination
            const isHighRisk = text.toLowerCase().includes("high risk") ||
                text.toLowerCase().includes("sanction") ||
                text.toLowerCase().includes("ambiguous") ||
                text.toLowerCase().includes("inspection");

            if (isHighRisk) {
                console.log(`[ComplianceAgent] High Risk detected for ${shipmentId}. Triggering Proactive Notification.`);
                await pathwayContext.updateStatus(shipmentId, "DELAYED", "Compliance Flag: Inspection Likely");
            } else {
                await pathwayContext.updateStatus(shipmentId, "VERIFIED", "Compliance Clear");
            }
        }

        return response;
    }
}

// Shared Interface for Extracted Data
export interface ExtractionData {
    invoice_number?: string;
    date?: string;
    vendor?: { name: string; address?: string };
    buyer?: { name: string; address?: string };
    total_amount?: number;
    currency?: string;
    line_items?: Array<{
        description: string;
        hs_code?: string;
        value?: number;
        quantity?: number;
        unit_price?: number;
        total?: number;
        discrepancy?: {
            expected: number;
            actual: number;
            item: string;
            reportedAt: string;
        };
    }>;
    weights?: { gross?: string; net?: string };
    vendor_email?: string;
    vendor_phone?: string;
    claimDraft?: string;
    lastUpdated?: string;
}

export class SearchAgent extends BaseAgent {
    readonly id = "search";
    readonly name = "Semantic Discovery";
    readonly description = "Finds related past shipments and identical products in the vector database";

    async run(context: { base64: string; format: FileFormat; filename: string; extractionData?: ExtractionData }): Promise<AgentResponse> {
        try {
            let queryText = "";

            // "World Class" Path: Use Extracted Entities if available for precise RAG
            if (context.extractionData && context.extractionData.line_items) {
                const items = context.extractionData.line_items.map(i => i.description).join(" ");
                const vendor = context.extractionData.vendor?.name || "";
                queryText = `Shipment from ${vendor} containing ${items}`;
                console.log(`[SearchAgent] Using Injected Context for Query: "${queryText}"`);
            } else {
                // Fallback: Ask Nova to generate a query (The "Smart Search" path from previous phase)
                const queryPrompt = `Analyze this supply chain document. Generate a specific, keyword-rich search query to find related past shipments. 
                Focus on: Supplier Name, Product Type (e.g. "Cotton Shirts"), and HS Codes. 
                Return ONLY the search query string.`;

                if (["jpeg", "png", "gif", "webp"].includes(context.format)) {
                    const res = await novaClient.analyzeImage(context.base64, queryPrompt, context.format as ImageFormat);
                    queryText = res.text;
                } else {
                    const res = await novaClient.analyzeDocument(context.base64, context.filename, context.format as DocumentFormat, queryPrompt);
                    queryText = res.text;
                }
                // Cleanup query
                queryText = queryText.replace(/"/g, "").trim();
                console.log(`[SearchAgent] Generated Query (Fallback): "${queryText}"`);
            }

            // 2. Perform Vector Search
            const results = await getRetriever().search(queryText, 3);

            if (results.length === 0) {
                return {
                    success: true,
                    data: {
                        status: "no_results",
                        message: `No related documents found for query: "${queryText}"`
                    }
                };
            }

            // 3. Format results
            const matches = results.map(r => ({
                filename: r.metadata.filename,
                score: r.score.toFixed(2),
                url: r.metadata.url
            }));

            return {
                success: true,
                data: {
                    embeddingStatus: "generated",
                    foundMatches: matches.length,
                    topResults: matches,
                    message: `Identified semantically related documents using query: "${queryText}"`
                }
            };
        } catch (error: any) {
            console.error("[SearchAgent] Vector Search critical failure:", error.message || error);
            return {
                success: false,
                error: `Search Unavailable: ${error.message || "Vector DB connection failure"}`,
                data: {
                    embeddingStatus: "failed",
                    foundMatches: 0,
                    topResults: [],
                    message: "Unable to retrieve historical patterns at this time."
                }
            };
        }
    }
}

import { type PipelineState } from "./types";

export class LearnerAgent extends BaseAgent {
    readonly id = "learner";
    readonly name = "Experience Architect";
    readonly description = "Reflects on pipeline outcomes to extract persistent rules and patterns";

    async run(context: { base64: string; format: FileFormat; filename: string; pipeline?: PipelineState;[key: string]: unknown }): Promise<AgentResponse> {
        try {
            if (!context.pipeline) {
                return { success: false, error: "Learner requires PipelineState in context" };
            }
            // Nova Learner doesn't need the image, just the pipeline JSON
            const prompt = PROMPTS.learner.replace("{{pipelineState}}", JSON.stringify(context.pipeline, null, 2));

            // We use Nova Pro for reasoning/reflection
            const result = await novaClient.analyzeDocument("", "pipeline.json", "text" as any, prompt);

            let data;
            try {
                data = JSON.parse(result.text.trim());
            } catch (e) {
                // Cleanup common JSON issues
                const clean = result.text.substring(result.text.indexOf("{"), result.text.lastIndexOf("}") + 1);
                data = JSON.parse(clean);
            }

            // Save each significant learning
            if (data.learnings) {
                for (const l of data.learnings) {
                    if (l.confidence > 0.7) {
                        await learningService.saveLearning(l);
                    }
                }
            }

            return { success: true, data };
        } catch (error: any) {
            console.error("[LearnerAgent] Learning reflection critical failure:", error.message || error);
            return {
                success: false,
                error: `Reflection Failed: ${error.message || "Internal reasoning error"}`,
                data: {
                    learnings: []
                }
            };
        }
    }

    // Learner doesn't use the standard run signature strictly, but we implement it for compatibility
    async runStandard(context: { base64: string; format: FileFormat; filename: string }): Promise<AgentResponse> {
        return { success: false, error: "Learner requires PipelineState" };
    }
}
