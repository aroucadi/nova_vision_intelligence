import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NOVA_MODELS } from "./types";

export interface EmbeddingOptions {
    dimensions?: number;
    outputFormat?: "float" | "int8";
}

export class NovaEmbeddings {
    private client: BedrockRuntimeClient;

    constructor(region: string = process.env.AWS_REGION || "us-east-1") {
        this.client = new BedrockRuntimeClient({ region });
    }

    /**
     * Generates embeddings for text, image, or both.
     * Note: Nova Multimodal Embeddings supports text + image multimodal input.
     */
    async generateEmbedding(input: {
        text?: string;
        image?: string; // base64
    }): Promise<number[]> {
        // MOCK MODE: Bypass AWS Bedrock if env var is set or if previous calls failed
        if (process.env.MOCK_AI === 'true') {
            console.log("⚠️  [Mock Mode] Generating fake embedding...");
            // Return random vector of size 1024 (Titan/Nova standard)
            return Array.from({ length: 1024 }, () => Math.random());
        }

        try {
            if (!input.text && !input.image) {
                throw new Error("Either text or image must be provided for embeddings");
            }

            const body: { inputText?: string; inputImage?: string } = {};
            if (input.text) body.inputText = input.text;
            if (input.image) body.inputImage = input.image;

            const command = new InvokeModelCommand({
                modelId: NOVA_MODELS.EMBEDDINGS,
                contentType: "application/json",
                accept: "application/json",
                body: JSON.stringify(body),
            });

            const response = await this.client.send(command);
            const result = JSON.parse(new TextDecoder().decode(response.body));

            return result.embedding;
        } catch (error) {
            console.error("Embedding generation failed:", error);
            // Auto-fallback to mock if it's the "Operation not allowed" error?
            // For now, just rethrow so the caller knows, UNLESS we want to force mock.
            throw error;
        }
    }

    /**
     * Helper to calculate cosine similarity between two vectors
     */
    calculateSimilarity(v1: number[], v2: number[]): number {
        if (v1.length !== v2.length) return 0;

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}

export const novaEmbeddings = new NovaEmbeddings();
