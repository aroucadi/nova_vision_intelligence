import { novaEmbeddings } from "./nova/embeddings";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// interface for a document in the vector store
export interface VectorDocument {
    id: string;
    text: string;
    metadata: Record<string, any>;
    embedding: number[];
}

interface SearchResult extends VectorDocument {
    score: number;
}

export class SimpleVectorStore {
    private documents: VectorDocument[] = [];
    private static instance: SimpleVectorStore;
    private readonly persistPath: string;
    private readonly s3Client: S3Client | null = null;
    private readonly bucketName: string | undefined;
    private readonly s3Key = "vector-store/index.json";
    private initPromise: Promise<void> | null = null;

    private constructor() {
        // Determine persistence path (temp dir for Vercel/Serverless compatibility)
        const tmpDir = process.env.tmp || "/tmp";
        this.persistPath = path.join(tmpDir, "simple-vector-store.json");

        // Initialize S3 Client if Env Var is present
        this.bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
        if (this.bucketName) {
            this.s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
        }
    }

    public static getInstance(): SimpleVectorStore {
        if (!SimpleVectorStore.instance) {
            SimpleVectorStore.instance = new SimpleVectorStore();
        }
        return SimpleVectorStore.instance;
    }

    /**
     * Add a document to the store
     */
    async addDocument(text: string, metadata: Record<string, any> = {}): Promise<string> {
        await this.ensureInit();
        const embedding = await novaEmbeddings.generateEmbedding({ text });

        const doc: VectorDocument = {
            id: nanoid(),
            text,
            metadata,
            embedding,
        };

        this.documents.push(doc);
        await this.save();
        console.log(`[VectorStore] Added document: ${metadata.filename || doc.id}`);
        return doc.id;
    }

    /**
     * Search for similar documents
     */
    async search(query: string, limit: number = 3): Promise<SearchResult[]> {
        await this.ensureInit();
        if (this.documents.length === 0) {
            return [];
        }

        const queryEmbedding = await novaEmbeddings.generateEmbedding({ text: query });

        // Calculate cosine similarity for all docs
        const results = this.documents.map((doc) => ({
            ...doc,
            score: this.cosineSimilarity(queryEmbedding, doc.embedding),
        }));

        // Sort by score (descending) and take top k
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        const denom = magnitudeA * magnitudeB;
        if (denom === 0) return 0;
        return dotProduct / denom;
    }

    /**
     * Save to disk (for simple persistence across warm reboots)
     */
    private async save() {
        if (this.s3Client && this.bucketName) {
            try {
                await this.s3Client.send(new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: this.s3Key,
                    Body: JSON.stringify(this.documents),
                    ContentType: "application/json"
                }));
                console.log(`[VectorStore] Saved ${this.documents.length} documents to S3: ${this.bucketName}/${this.s3Key}`);
            } catch (err) {
                console.warn("[VectorStore] Failed to save to S3:", err);
            }
        } else {
            // Local fallback
            try {
                await fs.writeFile(this.persistPath, JSON.stringify(this.documents), "utf-8");
            } catch (err) {
                console.warn("[VectorStore] Failed to save to disk:", err);
            }
        }
    }

    /**
     * Load from disk or S3
     */
    private async load() {
        if (this.s3Client && this.bucketName) {
            try {
                const response = await this.s3Client.send(new GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: this.s3Key
                }));
                const str = await response.Body?.transformToString();
                if (str) {
                    this.documents = JSON.parse(str);
                    console.log(`[VectorStore] Loaded ${this.documents.length} documents from S3`);
                }
            } catch (err) {
                console.log("[VectorStore] No existing store found in S3 (or error), starting empty.", err);
                this.documents = [];
            }
        } else {
            // Local fallback
            try {
                const data = await fs.readFile(this.persistPath, "utf-8");
                this.documents = JSON.parse(data);
                console.log(`[VectorStore] Loaded ${this.documents.length} documents from disk`);
            } catch (err) {
                this.documents = [];
            }
        }
    }

    /**
     * Clear the store (useful for testing)
     */
    async clear() {
        await this.ensureInit();
        this.documents = [];
        await this.save();
    }

    private async ensureInit() {
        if (!this.initPromise) {
            this.initPromise = this.load();
        }
        await this.initPromise;
    }
}

// Export singleton
export const vectorStore = SimpleVectorStore.getInstance();
