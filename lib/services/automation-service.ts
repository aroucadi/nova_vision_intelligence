import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export interface AutomationLog {
    automationId: string;
    timestamp: string;
    step: string;
    reasoning: string;
    status: "pending" | "success" | "failure";
    metadata?: Record<string, any>;
    ttl?: number;
}

export class AutomationService {
    private client: DynamoDBDocumentClient;
    private tableName: string;

    constructor() {
        const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
        this.client = DynamoDBDocumentClient.from(ddbClient);
        this.tableName = process.env.NOVA_AUTOMATION_LOGS_TABLE || "";
    }

    async logStep(log: Omit<AutomationLog, "timestamp">) {
        if (!this.tableName) {
            console.warn("[AutomationService] Table name missing, skipping log.");
            return;
        }

        const fullLog: AutomationLog = {
            ...log,
            timestamp: new Date().toISOString(),
            ttl: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hour retention
        };

        try {
            await this.client.send(new PutCommand({
                TableName: this.tableName,
                Item: fullLog
            }));
            console.log(`[AutomationService] [${log.automationId}] ${log.step}: ${log.status}`);
        } catch (error) {
            console.error("[AutomationService] Failed to log step:", error);
        }
    }

    async getLogs(automationId: string): Promise<AutomationLog[]> {
        if (!this.tableName) return [];

        try {
            const result = await this.client.send(new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: "automationId = :id",
                ExpressionAttributeValues: {
                    ":id": automationId
                },
                ScanIndexForward: true // Sort by timestamp ASC
            }));
            return (result.Items as AutomationLog[]) || [];
        } catch (error) {
            console.error("[AutomationService] Failed to query logs:", error);
            return [];
        }
    }
}

export const automationService = new AutomationService();
