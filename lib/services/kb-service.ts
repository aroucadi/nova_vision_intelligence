import {
    BedrockAgentRuntimeClient,
    RetrieveCommand,
    RetrieveResponse
} from "@aws-sdk/client-bedrock-agent-runtime";
import {
    BedrockAgentClient,
    StartIngestionJobCommand
} from "@aws-sdk/client-bedrock-agent";

export interface RetrievalResult {
    content: string;
    metadata: Record<string, any>;
    score: number;
}

export class KnowledgeBaseService {
    private runtimeClient: BedrockAgentRuntimeClient;
    private agentClient: BedrockAgentClient;
    private kbId: string;
    private dataSourceId: string;

    constructor() {
        const region = process.env.AWS_REGION || "us-east-1";
        const credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        };
        this.runtimeClient = new BedrockAgentRuntimeClient({ region, credentials });
        this.agentClient = new BedrockAgentClient({ region, credentials });
        this.kbId = process.env.KNOWLEDGE_BASE_ID || "";
        this.dataSourceId = process.env.DATA_SOURCE_ID || "";
    }

    /**
     * Executes semantic search against Bedrock Knowledge Base
     */
    async retrieve(query: string, limit: number = 3): Promise<RetrievalResult[]> {
        if (!this.kbId) {
            console.warn("[KBService] No KNOWLEDGE_BASE_ID found, RAG will be limited.");
            return [];
        }

        try {
            const command = new RetrieveCommand({
                knowledgeBaseId: this.kbId,
                retrievalQuery: {
                    text: query,
                },
                retrievalConfiguration: {
                    vectorSearchConfiguration: {
                        numberOfResults: limit,
                    },
                },
            });

            const response = await this.runtimeClient.send(command);

            return (response.retrievalResults || []).map(res => ({
                content: res.content?.text || "",
                metadata: res.metadata || {},
                score: res.score || 0
            }));
        } catch (error) {
            console.error("[KBService] Retrieval failed:", error);
            return [];
        }
    }

    /**
     * Triggers a sync (ingestion job) for the data source
     */
    async sync(): Promise<string | undefined> {
        if (!this.kbId || !this.dataSourceId) {
            throw new Error("KNOWLEDGE_BASE_ID and DATA_SOURCE_ID are required for sync.");
        }

        try {
            const command = new StartIngestionJobCommand({
                knowledgeBaseId: this.kbId,
                dataSourceId: this.dataSourceId
            });

            const response = await this.agentClient.send(command);
            return response.ingestionJob?.ingestionJobId;
        } catch (error) {
            console.error("[KBService] Sync failed:", error);
            throw error;
        }
    }
}

// Production-ready real service export
export const kbService = new KnowledgeBaseService();
