
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export interface PathwayContext {
    shipmentId: string; // Corresponds to Entry Number
    status: "CREATED" | "FILED" | "IN_TRANSIT" | "DELAYED" | "ARRIVED" | "VERIFIED" | "DISCREPANCY" | "RELEASED";
    alerts: string[]; // e.g., "Inspection likely due to ambiguous HS Code"
    discrepancy?: {
        expected: number;
        actual: number;
        item: string;
        reportedAt: string;
    };
    lastUpdated: string;
}

export interface PathwayService {
    getContext(shipmentId: string): Promise<PathwayContext | null>;
    updateStatus(shipmentId: string, status: PathwayContext["status"], alert?: string): Promise<void>;
    reportDiscrepancy(shipmentId: string, discrepancy: PathwayContext["discrepancy"]): Promise<void>;
    initializeShipment(shipmentId: string): Promise<void>;
}

/**
 * In-Memory Store (Default for Development/Demo)
 */
export class InMemoryPathwayStore implements PathwayService {
    private store: Map<string, PathwayContext> = new Map();

    async initializeShipment(shipmentId: string): Promise<void> {
        this.store.set(shipmentId, {
            shipmentId,
            status: "CREATED",
            alerts: [],
            lastUpdated: new Date().toISOString()
        });
        console.log(`[GlobalPathway] Initialized shipment ${shipmentId}`);
    }

    async getContext(shipmentId: string): Promise<PathwayContext | null> {
        return this.store.get(shipmentId) || null;
    }

    async updateStatus(shipmentId: string, status: PathwayContext["status"], alert?: string): Promise<void> {
        const ctx = this.store.get(shipmentId);
        if (ctx) {
            ctx.status = status;
            ctx.lastUpdated = new Date().toISOString();
            if (alert) {
                ctx.alerts.push(alert);
            }
            this.store.set(shipmentId, ctx);
            console.log(`[GlobalPathway] Updated ${shipmentId} -> ${status} (Alert: ${alert})`);
        }
    }

    async reportDiscrepancy(shipmentId: string, discrepancy: PathwayContext["discrepancy"]): Promise<void> {
        const ctx = this.store.get(shipmentId);
        if (ctx) {
            ctx.status = "DISCREPANCY";
            ctx.discrepancy = discrepancy;
            ctx.lastUpdated = new Date().toISOString();
            this.store.set(shipmentId, ctx);
            console.log(`[GlobalPathway] Discrepancy reported for ${shipmentId}:`, discrepancy);
        }
    }
}

/**
 * DynamoDB Store (For Production Persistence)
 */
export class DynamoDBPathwayStore implements PathwayService {
    private tableName: string;
    private client: DynamoDBDocumentClient;

    constructor(tableName: string) {
        this.tableName = tableName;
        const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
        this.client = DynamoDBDocumentClient.from(ddbClient);
    }

    async initializeShipment(shipmentId: string): Promise<void> {
        const context: PathwayContext = {
            shipmentId,
            status: "CREATED",
            alerts: [],
            lastUpdated: new Date().toISOString()
        };

        await this.client.send(new PutCommand({
            TableName: this.tableName,
            Item: {
                pk: `PATHWAY#${shipmentId}`,
                sk: `CONTEXT`,
                ...context,
                ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h TTL
            }
        }));
    }

    async getContext(shipmentId: string): Promise<PathwayContext | null> {
        try {
            const result = await this.client.send(new GetCommand({
                TableName: this.tableName,
                Key: {
                    pk: `PATHWAY#${shipmentId}`,
                    sk: `CONTEXT`
                }
            }));
            return result.Item as PathwayContext || null;
        } catch (error) {
            console.error("[DynamoDBPathway] Get Error:", error);
            return null;
        }
    }

    async updateStatus(shipmentId: string, status: PathwayContext["status"], alert?: string): Promise<void> {
        try {
            await this.client.send(new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    pk: `PATHWAY#${shipmentId}`,
                    sk: `CONTEXT`
                },
                UpdateExpression: "SET #status = :s, lastUpdated = :t" + (alert ? ", alerts = list_append(if_not_exists(alerts, :empty_list), :a)" : ""),
                ExpressionAttributeNames: {
                    "#status": "status"
                },
                ExpressionAttributeValues: {
                    ":s": status,
                    ":t": new Date().toISOString(),
                    ...(alert ? { ":a": [alert], ":empty_list": [] } : {})
                }
            }));
        } catch (error) {
            console.error("[DynamoDBPathway] Update Status Error:", error);
        }
    }

    async reportDiscrepancy(shipmentId: string, discrepancy: PathwayContext["discrepancy"]): Promise<void> {
        try {
            await this.client.send(new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    pk: `PATHWAY#${shipmentId}`,
                    sk: `CONTEXT`
                },
                UpdateExpression: "SET #status = :s, discrepancy = :d, lastUpdated = :t",
                ExpressionAttributeNames: {
                    "#status": "status"
                },
                ExpressionAttributeValues: {
                    ":s": "DISCREPANCY",
                    ":d": discrepancy,
                    ":t": new Date().toISOString()
                }
            }));
        } catch (error) {
            console.error("[DynamoDBPathway] Report Discrepancy Error:", error);
        }
    }
}
