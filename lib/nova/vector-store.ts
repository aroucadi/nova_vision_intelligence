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
    private mockData: VectorResult[] = [
        {
            id: "1",
            metadata: {
                filename: "claim_history_shenzhen_2023.pdf",
                content: "Previous shortage claim for Shenzhen Tech Mfg resolved within 48 hours. Vendor was responsive."
            },
            score: 0.95
        },
        {
            id: "2",
            metadata: {
                filename: "vendor_compliance_notes.csv",
                content: "TechImports LLC has high reliability rating. Port of LAX handled previous discrepancies."
            },
            score: 0.88
        }
    ];

    async search(query: string, limit: number = 2): Promise<VectorResult[]> {
        const kbId = process.env.KNOWLEDGE_BASE_ID;

        if (kbId) {
            console.log(`[VectorStore] Using Real Bedrock RAG for query: ${query}`);
            const results = await kbService.retrieve(query, limit);
            return results.map((r, i) => ({
                id: i.toString(),
                metadata: {
                    filename: r.metadata.filename || "unknown_doc",
                    content: r.content,
                    url: r.metadata.s3Uri
                },
                score: r.score
            }));
        }

        console.log(`[VectorStore] Using Mock RAG for query: ${query}`);
        return this.mockData.slice(0, limit);
    }

    async add(id: string, text: string, metadata: any): Promise<void> {
        console.log(`[VectorStore] Ingestion is handled via Admin Sync API or S3 Triggers.`);
    }
}

export const vectorStore = new VectorStore();
