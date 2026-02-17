
import { InMemoryPathwayStore, DynamoDBPathwayStore, PathwayService } from "@/lib/services/global-pathway-service";

/**
 * Global Pathway Context Singleton
 * 
 * This provides a unified access point for the entire application to read/write
 * the "Shipment Lifecycle State".
 * 
 * It automatically chooses between DynamoDB (Production) and In-Memory (Dev/Demo).
 */

let instance: PathwayService;

if (process.env.NOVA_GLOBAL_STATE_TABLE) {
    console.log("[GlobalPathway] Initializing with DynamoDB Store");
    instance = new DynamoDBPathwayStore(process.env.NOVA_GLOBAL_STATE_TABLE);
} else {
    // Check if we already have a global instance (hot reload safe for Next.js)
    if (!(global as any).__pathwayService) {
        console.log("[GlobalPathway] Initializing with In-Memory Store");
        (global as any).__pathwayService = new InMemoryPathwayStore();
    }
    instance = (global as any).__pathwayService;
}

export const pathwayContext = instance;
