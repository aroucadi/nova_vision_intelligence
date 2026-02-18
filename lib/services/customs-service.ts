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
        hsCode: string;
        quantity: number;
        value: number;
    }>;
    totalDuty: number;
    vendor?: string;
    vendor_email?: string;
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

    async seedData(): Promise<void> {
        const entries: CustomsEntry[] = [
            {
                entryNumber: "111-1234567-8",
                filerCode: "999",
                importer: "TechImports LLC",
                portOfEntry: "LAX",
                timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
                status: "RELEASED",
                items: [
                    { description: "Wireless Security Cameras", hsCode: "8525.80.30", value: 5000, quantity: 50 }
                ],
                totalDuty: 0,
                vendor: "Shenzhen Tech Mfg.",
                vendor_email: "shipping@shenzhentech.com",
                documents: ["s3://nova-uploads/invoice_123.pdf"]
            },
            {
                entryNumber: "111-8765432-1",
                filerCode: "999",
                importer: "Global Textiles Inc",
                portOfEntry: "NYC",
                timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
                status: "HELD",
                items: [
                    { description: "Cotton T-Shirts", hsCode: "6109.10.00", value: 2500, quantity: 500 }
                ],
                totalDuty: 412.50,
                documents: ["s3://nova-uploads/invoice_456.pdf"]
            }
        ];

        for (const entry of entries) {
            await dynamoDb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: entry,
            }));
        }
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
