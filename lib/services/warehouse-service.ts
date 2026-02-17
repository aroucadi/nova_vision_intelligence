import { dynamoDb } from "@/lib/aws/dynamo"; // Absolute path alias
import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.NOVA_WAREHOUSE_TABLE || "NovaWarehouseTable";

export interface WarehouseItem {
    sku: string;
    name: string;
    quantity: number;
    location: string; // Bin ID, e.g., "A-12-3"
    status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
    lastUpdated: string;
}

export class WarehouseService {
    async getItem(sku: string): Promise<WarehouseItem | null> {
        const result = await dynamoDb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { sku },
        }));
        return (result.Item as WarehouseItem) || null;
    }

    async updateStock(sku: string, quantityChange: number): Promise<WarehouseItem> {
        // Atomic increment/decrement
        const result = await dynamoDb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { sku },
            UpdateExpression: "set quantity = quantity + :val, lastUpdated = :time",
            ExpressionAttributeValues: {
                ":val": quantityChange,
                ":time": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
        }));

        const updatedItem = result.Attributes as WarehouseItem;

        // Check if status update is needed based on new quantity
        let status: WarehouseItem["status"] = "IN_STOCK";
        if (updatedItem.quantity <= 0) status = "OUT_OF_STOCK";
        else if (updatedItem.quantity < 10) status = "LOW_STOCK";

        if (status !== updatedItem.status) {
            await dynamoDb.send(new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { sku },
                UpdateExpression: "set #status = :s",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: { ":s": status },
            }));
            updatedItem.status = status;
        }

        return updatedItem;
    }

    async getAllItems(): Promise<WarehouseItem[]> {
        const result = await dynamoDb.send(new ScanCommand({
            TableName: TABLE_NAME,
        }));
        return (result.Items as WarehouseItem[]) || [];
    }

    async seedData(): Promise<void> {
        // Initial seed if table is empty
        const items: WarehouseItem[] = [
            // Electronics
            { sku: "WC-1080P", name: "Wireless Security Camera (1080p)", quantity: 50, location: "B-04-12", status: "IN_STOCK", lastUpdated: new Date().toISOString() },
            { sku: "MB-STEEL", name: "Wall Mount Bracket", quantity: 120, location: "A-01-05", status: "IN_STOCK", lastUpdated: new Date().toISOString() },
            { sku: "CB-5M", name: "Power Extension Cable (5M)", quantity: 5, location: "C-12-01", status: "LOW_STOCK", lastUpdated: new Date().toISOString() },
            { sku: "LIT-ION-2000", name: "Lithium-Ion Battery Pack (2000mAh)", quantity: 200, location: "H-09-02", status: "IN_STOCK", lastUpdated: new Date().toISOString() },

            // Apparel / Textiles
            { sku: "TS-COT-L-BLK", name: "Cotton T-Shirt (L, Black)", quantity: 500, location: "T-03-01", status: "IN_STOCK", lastUpdated: new Date().toISOString() },
            { sku: "JEAN-DNM-32", name: "Denim Jeans (32W)", quantity: 0, location: "T-04-05", status: "OUT_OF_STOCK", lastUpdated: new Date().toISOString() },

            // Industrial
            { sku: "VALVE-HYD-X", name: "Hydraulic Valve (X-Series)", quantity: 15, location: "I-02-10", status: "IN_STOCK", lastUpdated: new Date().toISOString() },
        ];

        for (const item of items) {
            await dynamoDb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: item,
            }));
        }
    }
}

export const warehouseService = new WarehouseService();
