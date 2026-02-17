import { dynamoDb } from "@/lib/aws/dynamo"; // Absolute path alias
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.NOVA_CUSTOMS_TABLE || "NovaCustomsTable";

export interface CustomsEntry {
    entryNumber: string;
    filerCode: string;
    importer: string;
    portOfEntry: string;
    timestamp: string;
    status: "FILED" | "CLEARED" | "RELEASED" | "HELD";
    items: Array<{
        description: string;
        htsus: string;
        value: number;
        quantity?: number;
        unit_price?: number;
    }>;
    totalDuty: number;
    documents: string[];
}

export class CustomsService {
    async fileEntry(entry: CustomsEntry): Promise<CustomsEntry> {
        await dynamoDb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: entry,
        }));
        return entry;
    }

    async getEntry(entryNumber: string): Promise<CustomsEntry | null> {
        const result = await dynamoDb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { entryNumber },
        }));
        return (result.Item as CustomsEntry) || null;
    }

    async updateStatus(entryNumber: string, status: CustomsEntry["status"]): Promise<void> {
        // Fetch first to preserve other fields, or use UpdateCommand if partial update is preferred
        // For simplicity in this demo, we'll do a read-modify-write or just partial update if needed.
        // Actually, update is better.
        const { UpdateCommand } = await import("@aws-sdk/lib-dynamodb");
        await dynamoDb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { entryNumber },
            UpdateExpression: "set #status = :s",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: { ":s": status },
        }));
    }

    async getAllEntries(): Promise<CustomsEntry[]> {
        // Scan is okay for a demo/sandbox with limited data
        const result = await dynamoDb.send(new ScanCommand({
            TableName: TABLE_NAME,
        }));
        return (result.Items as CustomsEntry[]) || [];
    }
}

export const customsService = new CustomsService();
