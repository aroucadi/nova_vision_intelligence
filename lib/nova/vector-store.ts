/**
 * Mock Vector Store for RAG-lite capabilities.
 * In a production scenario, this would connect to Amazon OpenSearch or pgvector.
 */

export interface VectorResult {
    id: string;
    metadata: {
        filename: string;
        content: string;
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
        console.log(`[VectorStore] Searching for: ${query}`);
        // Simple mock search returns top results
        return this.mockData.slice(0, limit);
    }

    async add(id: string, text: string, metadata: any): Promise<void> {
        console.log(`[VectorStore] Indexing document: ${id}`);
    }
}

export const vectorStore = new VectorStore();
