import { vectorStore } from "../nova/vector-store";
import { kbService } from "./kb-service";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface Learning {
    id: string;
    topic: string;
    observation: string;
    suggestedRule: string;
    confidence: number;
    timestamp: string;
    metadata: Record<string, any>;
}

export class LearningService {
    private s3Client: S3Client;
    private bucketName: string;
    private inMemoryCache: Map<string, string[]> = new Map();

    constructor() {
        this.s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
        this.bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || ""; // Reusing the same bucket for simplicity in this levelup
        this.syncDebounced = this.debounce(this.triggerSync.bind(this), 60000);
    }

    private syncDebounced: () => void;
    private isSyncing: boolean = false;

    private debounce(func: Function, wait: number) {
        let timeout: NodeJS.Timeout | null = null;
        return (...args: any[]) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    private async triggerSync() {
        if (this.isSyncing) return;
        this.isSyncing = true;
        try {
            console.log(`[LearningService] Executing Batch Bedrock KB Sync...`);
            await kbService.sync();
            console.log(`[LearningService] Batch Sync successful.`);
        } catch (error) {
            console.warn(`[LearningService] Batch Sync failed:`, error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Retrieves relevant learnings for a given topic or context
     */
    async retrieveLearnings(query: string): Promise<string[]> {
        console.log(`[LearningService] Searching for historical learnings matching: "${query}"`);

        // 1. Check In-Memory Cache (Instant feedback for demo/current session)
        const cached = this.inMemoryCache.get(query);
        if (cached) {
            console.log(`[LearningService] Found ${cached.length} learnings in local cache.`);
            return cached;
        }

        const results = await vectorStore.search(`Learning related to: ${query}`, 3);

        // Filter for results that are explicitly learnings (optional if using dedicated KB)
        return results.map(r => r.metadata.content);
    }

    /**
     * Saves a new learning to the Knowledge Base
     * In Bedrock, we upload the file to S3 and then sync the KB.
     */
    async saveLearning(learning: Omit<Learning, "id" | "timestamp">): Promise<boolean> {
        const id = `learning-${Date.now()}`;
        const timestamp = new Date().toISOString();
        const fullLearning: Learning = { ...learning, id, timestamp };

        const content = `
# Learning: ${fullLearning.topic}
**Observation**: ${fullLearning.observation}
**Suggested Rule**: ${fullLearning.suggestedRule}
**Confidence**: ${fullLearning.confidence}
**Timestamp**: ${fullLearning.timestamp}
**Target Entities**: ${JSON.stringify(fullLearning.metadata)}
        `.trim();

        // 0. Update In-Memory Cache (For instant proof in demo-scripts)
        const topic = fullLearning.metadata.vendor || fullLearning.topic;
        const current = this.inMemoryCache.get(topic) || [];
        this.inMemoryCache.set(topic, [...current, fullLearning.suggestedRule]);

        try {
            console.log(`[LearningService] Saving new learning to S3: ${id}.md`);

            // 1. Upload to S3
            const uploadCommand = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: `learnings/${id}.md`,
                Body: content,
                ContentType: "text/markdown",
                Metadata: {
                    "type": "learning",
                    "topic": fullLearning.topic
                }
            });
            await this.s3Client.send(uploadCommand);

            // 2. Trigger KB Sync (Batch Optimized)
            this.syncDebounced();

            return true;
        } catch (error) {
            console.error("[LearningService] Failed to save learning:", error);
            return false;
        }
    }
}

export const learningService = new LearningService();
