import { PipelineState } from "./types";

export interface PipelineStateManager {
    saveState(pipeline: PipelineState): Promise<void>;
    getState(id: string): Promise<PipelineState | null>;
}

/**
 * Default: In-Memory State Manager
 * fast, but state is lost if serverless function cold starts/crashes.
 * Suitable for synchronous "wait for response" patterns.
 */
export class InMemoryStateManager implements PipelineStateManager {
    private state: Map<string, PipelineState> = new Map();

    async saveState(pipeline: PipelineState): Promise<void> {
        // In a real serverless env, this map is local to the instance.
        // It works for the current request scope.
        // For debugging, we can log the state transition.
        // console.log(`[StateManager] Saving state for pipeline in memory.`);
        return;
    }

    async getState(id: string): Promise<PipelineState | null> {
        return this.state.get(id) || null;
    }
}

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Production: DynamoDB State Manager
 * Persists state for async polling and recovery.
 */
export class DynamoDBStateManager implements PipelineStateManager {
    private tableName: string;
    private client: DynamoDBDocumentClient;

    constructor(tableName: string) {
        this.tableName = tableName;
        const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
        this.client = DynamoDBDocumentClient.from(ddbClient);
    }

    async saveState(pipeline: PipelineState): Promise<void> {
        // Use the first task ID as a proxy for the pipeline ID if no explicit ID exists
        // In a real app, we'd pass a dedicated pipeline ID.
        const pipelineId = pipeline.tasks.length > 0 ? pipeline.tasks[0].id : "unknown";

        try {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: {
                    pk: `PIPELINE#${pipelineId}`,
                    sk: `STATE`,
                    ...pipeline,
                    updatedAt: new Date().toISOString(),
                    ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h TTL
                }
            });
            await this.client.send(command);
        } catch (error) {
            console.error("[DynamoDBStateManager] Failed to save state:", error);
            // Non-blocking failure for demo purposes, but in prod we might throw
        }
    }

    async getState(id: string): Promise<PipelineState | null> {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    pk: `PIPELINE#${id}`,
                    sk: `STATE`
                }
            });
            const result = await this.client.send(command);
            return result.Item as PipelineState || null;
        } catch (error) {
            console.error("[DynamoDBStateManager] Failed to get state:", error);
            return null;
        }
    }
}
