import { kbService, RetrievalResult } from "../services/kb-service";

export interface VectorResult {
    id: string;
    metadata: {
        filename: string;
        content: string;
        url?: string;
    };
    score: number;
}

class VectorStore {

    async search(query: string, limit: number = 2): Promise<VectorResult[]> {
        const kbId = process.env.KNOWLEDGE_BASE_ID;

        if (kbId) {
            console.log(`[VectorStore] Using Real Bedrock RAG for query: ${query}`);
            const results = await kbService.retrieve(query, limit);
            return results.map((r: RetrievalResult, i: number) => ({
                id: i.toString(),
                metadata: {
                    filename: r.metadata.filename || "unknown_doc",
                    content: r.content,
                    url: r.metadata.s3Uri
                },
                score: r.score
            }));
        }

        console.warn(`[VectorStore] RAG not configured (KNOWLEDGE_BASE_ID missing). Returning empty results.`);
        return [];
    }

    async add(id: string, text: string, metadata: any): Promise<void> {
        console.log(`[VectorStore] Ingestion is handled via Admin Sync API or S3 Triggers.`);
    }
}

export const vectorStore = new VectorStore();
