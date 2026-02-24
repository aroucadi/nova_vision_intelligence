import {
    BedrockRuntimeClient,
    ConverseCommand,
    type ConverseCommandInput,
    type Message,
    type SystemContentBlock,
    type ContentBlock,
} from "@aws-sdk/client-bedrock-runtime";
import { NOVA_MODELS, type ImageFormat } from "./types";

/**
 * Amazon Nova 2 Client (Upgraded to Pro)
 *
 * Uses the Converse API for unified interaction.
 * Model: us.amazon.nova-pro-v1:0 (Flagship Intelligence)
 * Capabilities: text, images, video, documents (up to 1M tokens context)
 * Features: extended thinking, structured output, tool use
 */
export class NovaClient {
    private _client: BedrockRuntimeClient | null = null;

    private get client(): BedrockRuntimeClient {
        if (!this._client) {
            this._client = new BedrockRuntimeClient({
                region: process.env.AWS_REGION || "us-east-1",
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
                },
            });
        }
        return this._client;
    }

    constructor() { }

    /**
     * Core Converse API call to Nova 2 Lite
     */
    async converse(
        messages: Message[],
        options: {
            system?: string;
            maxTokens?: number;
            temperature?: number;
            enableReasoning?: boolean;
            reasoningEffort?: "low" | "medium" | "high";
            model?: "pro" | "lite";
        } = {}
    ): Promise<{
        text: string;
        usage: { inputTokens: number; outputTokens: number };
    }> {
        const {
            system,
            maxTokens = 4096,
            temperature = 0.7,
            enableReasoning = false,
            reasoningEffort = "medium",
            model = "pro",
        } = options;

        const input: ConverseCommandInput = {
            modelId: model === "lite" ? NOVA_MODELS.LITE : NOVA_MODELS.PRO,
            messages,
            inferenceConfig: {
                maxTokens,
                temperature,
            },
        };

        if (system) {
            input.system = [{ text: system } as SystemContentBlock];
        }

        if (enableReasoning) {
            input.additionalModelRequestFields = {
                reasoningConfig: {
                    type: "enabled",
                    maxReasoningEffort: reasoningEffort,
                },
            };
        }

        const command = new ConverseCommand(input);
        const response = await this.client.send(command);

        const outputContent = response.output?.message?.content || [];
        const text = outputContent
            .map((block) => {
                if ("text" in block && block.text) return block.text;
                return "";
            })
            .filter(Boolean)
            .join("\n");

        return {
            text,
            usage: {
                inputTokens: response.usage?.inputTokens || 0,
                outputTokens: response.usage?.outputTokens || 0,
            },
        };
    }

    /**
     * Analyze image with Nova 2 Lite multimodal understanding
     */
    async analyzeImage(
        imageBase64: string,
        prompt: string,
        format: ImageFormat = "jpeg",
        options: { enableReasoning?: boolean; reasoningEffort?: "low" | "medium" | "high" } = {}
    ): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
        const imageBytes = Buffer.from(imageBase64, "base64");

        const messages: Message[] = [
            {
                role: "user",
                content: [
                    {
                        image: {
                            format,
                            source: { bytes: imageBytes },
                        },
                    } as ContentBlock,
                    { text: prompt } as ContentBlock,
                ],
            },
        ];

        return this.converse(messages, {
            maxTokens: 4096,
            enableReasoning: options.enableReasoning,
            reasoningEffort: options.reasoningEffort,
        });
    }

    /**
     * Analyze document with Nova 2 Lite (supports up to 1M tokens context)
     */
    async analyzeDocument(
        docBase64: string,
        docName: string,
        format: "pdf" | "csv" | "doc" | "docx" | "html" | "txt" | "md" | "xls" | "xlsx",
        prompt: string,
        options: { enableReasoning?: boolean } = {}
    ): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {

        const docBytes = Buffer.from(docBase64, "base64");

        const messages: Message[] = [
            {
                role: "user",
                content: [
                    {
                        document: {
                            format,
                            name: docName,
                            source: { bytes: docBytes },
                        },
                    } as ContentBlock,
                    { text: prompt } as ContentBlock,
                ],
            },
        ];

        return this.converse(messages, {
            maxTokens: 4096,
            enableReasoning: options.enableReasoning,
        });
    }

    /**
     * Extract structured data as JSON
     */
    async extractStructured<T = Record<string, unknown>>(
        imageBase64: string,
        schema: Record<string, unknown>,
        format: ImageFormat = "jpeg"
    ): Promise<T | null> {
        const prompt = `You are an automated Data Extraction AI.
<task>
Extract semantic information from the provided image and map it STRICTLY to the following JSON schema.
</task>

<schema_definition>
${JSON.stringify(schema, null, 2)}
</schema_definition>

<constraints>
1. Return ONLY valid JSON.
2. Do NOT include markdown formatting (like \`\`\`json).
3. If a field represents a number, ensure it is a number type.
4. If data is missing, use null.
</constraints>

Think step-by-step:
1. Analyze the image to identify key regions.
2. Map text/values to the schema fields.
3. Validate types (e.g. strings vs numbers).
4. Generate the final JSON.`;

        const result = await this.analyzeImage(imageBase64, prompt, format);
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        try {
            return JSON.parse(jsonMatch[0]) as T;
        } catch {
            return null;
        }
    }

    /**
     * Answer question about visual content
     */
    async answerQuestion(
        imageBase64: string,
        question: string,
        format: ImageFormat = "jpeg"
    ): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
        return this.analyzeImage(
            imageBase64,
            `User Question: "${question}"
            
<instructions>
1. Analyze the image visually.
2. Provide a clear, concise, and accurate answer based ONLY on what you can see.
3. Do not assume context not visible in the frame.
</instructions>`,
            format
        );
    }

    /**
     * Generate comprehensive summary with extended thinking
     */
    async generateSummary(
        imageBase64: string,
        format: ImageFormat = "jpeg"
    ): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
        return this.analyzeImage(
            imageBase64,
            `Act as a Visual Intelligence Analyst.
<task>
Analyze this content and provide a comprehensive summary.
</task>

<output_structure>
- **Main Findings**: 3-5 key bullet points.
- **Data Points**: Important dates, numbers, or identifiers.
- **Patterns**: Any visual or structural trends.
- **Attention**: Any anomalies or concerns.
</output_structure>

Be clear, concise, and actionable.`,
            format,
            { enableReasoning: true, reasoningEffort: "medium" }
        );
    }

    /**
     * Classify content type and sensitivity
     */
    async classifyContent(
        imageBase64: string,
        format: ImageFormat = "jpeg"
    ): Promise<{
        category: string;
        subcategories: string[];
        confidence: number;
        sensitive: boolean;
    }> {
        const result = await this.analyzeImage(
            imageBase64,
            `Act as a Content Taxonomist.
<task>
Classify the provided image into a hierarchical category.
</task>

<output_schema>
{
  "category": "string (Primary Category)",
  "subcategories": ["string", "string"],
  "confidence": number (0.0 to 1.0),
  "sensitive": boolean (true if PII/Financial/Medical data detected)
}
</output_schema>

<constraints>
Return ONLY valid JSON matching the schema.
</constraints>`,
            format
        );

        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch {
                // fallthrough
            }
        }

        return {
            category: "Unknown",
            subcategories: [],
            confidence: 0,
            sensitive: false,
        };
    }

    /**
     * Compliance and privacy analysis
     */
    async checkCompliance(
        imageBase64: string,
        format: ImageFormat = "jpeg"
    ): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
        return this.analyzeImage(
            imageBase64,
            `Analyze this content for compliance and privacy:
- Identify any Personally Identifiable Information (PII)
- Flag financial information (account numbers, credit cards)
- Detect health/medical information (HIPAA relevant)
- Note any legal or contractual terms
- Highlight redaction requirements

Return structured findings with locations and recommendations.`,
            format,
            { enableReasoning: true, reasoningEffort: "high" }
        );
    }
}

// Singleton instance
export const novaClient = new NovaClient();
