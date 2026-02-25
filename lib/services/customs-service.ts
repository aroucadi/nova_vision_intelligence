import { dynamoDb } from "@/lib/aws/dynamo"; // Absolute path alias
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
        try {
            await dynamoDb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: entry,
            }));
        } catch (e) {
            console.error("[CustomsService] DynamoDB unreachable, failing fileEntry", e);
            throw new Error("Persistence Failure: Entry not stored.");
        }
        return entry;
    }

    async getEntry(entryNumber: string): Promise<CustomsEntry | null> {
        try {
            const result = await dynamoDb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { entryNumber },
            }));
            return (result.Item as CustomsEntry) || null;
        } catch (e) {
            console.warn("[CustomsService] DynamoDB unreachable, using null for getEntry", e);
            return null;
        }
    }

    async updateStatus(entryNumber: string, status: CustomsEntry["status"]): Promise<void> {
        try {
            const { UpdateCommand } = await import("@aws-sdk/lib-dynamodb");
            await dynamoDb.send(new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { entryNumber },
                UpdateExpression: "set #status = :s",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: { ":s": status },
            }));
        } catch (e) {
            console.warn("[CustomsService] DynamoDB unreachable, skip updateStatus", e);
        }
    }

    async getAllEntries(): Promise<CustomsEntry[]> {
        try {
            const result = await dynamoDb.send(new ScanCommand({
                TableName: TABLE_NAME,
            }));
            return (result.Items as CustomsEntry[]) || [];
        } catch (e: any) {
            console.error("[CustomsService] DynamoDB Scan failed:", e.message || e);
            return []; // Fail gracefully with empty data rather than faking reality
        }
    }

    private async uploadToKnowledgeBucket(filename: string, content: string) {
        const bucketName = `nova-knowledge-${process.env.CDK_DEFAULT_ACCOUNT || 'sandbox'}-${process.env.AWS_REGION || 'us-east-1'}`;
        try {
            const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
            await s3.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: `documents/${filename}`,
                Body: content,
                ContentType: "text/markdown"
            }));
            console.log(`[UnifiedSeed] Uploaded ${filename} to RAG Knowledge Bucket`);
        } catch (e) {
            console.error(`[UnifiedSeed] S3 Upload Fail: ${filename}`, e);
        }
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

            // UNIFIED SEEDING: Create a corresponding knowledge document for RAG
            const kbDocument = `# Customs Entry: ${entry.entryNumber}
Vendor: ${entry.vendor}
Importer: ${entry.importer}
Status: ${entry.status}
Historical Reliability: ${entry.importer === "TechImports LLC" ? "HIGH. Previous discrepancies resolved quickly." : "MEDIUM."}
Note: This document provides context for RAG agents.`;

            await this.uploadToKnowledgeBucket(`entry_${entry.entryNumber}.md`, kbDocument);
        }
    }
}

export const customsService = new CustomsService();
