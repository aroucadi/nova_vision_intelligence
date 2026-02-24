export class MockKnowledgeBaseService {
    async retrieve(query: string, limit: number = 3) {
        console.log(`[MockKB] Simulating retrieval for: "${query}"`);

        // Deterministic mappings for the Hackathon Demo
        if (query.toLowerCase().includes("global-logistics-x")) {
            return [{
                content: "Learned Rule: Always interpret dates from Global-Logistics-X as Day/Month/Year (DD/MM/YYYY). Previously verified across 3 shipments.",
                metadata: { type: "learning", vendor: "Global-Logistics-X" },
                score: 0.99
            }];
        }

        if (query.toLowerCase().includes("hs code") || query.toLowerCase().includes("classification")) {
            return [{
                content: "Standard HS Classification Rule: Women's blouses of man-made fibers are categorized under 6106.10 (Duty Rate: 2.5%).",
                metadata: { type: "reference" },
                score: 0.95
            }];
        }

        return [];
    }

    async sync() {
        console.log("[MockKB] Syncing simulated Knowledge Base...");
        return "mock-sync-job-" + Date.now();
    }
}

export const kbService = new MockKnowledgeBaseService();
