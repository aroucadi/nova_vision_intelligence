import { CustomsEntry, customsService } from "@/lib/services/customs-service";

/**
 * Nova Act Registry (Persistent)
 * 
 * Now backed by AWS DynamoDB via `CustomsService`.
 * This acts as the "Broker Interface" for the Customs "ACE" system.
 */

export type { CustomsEntry };

class FilingRegistry {

    public async fileEntry(data: Omit<CustomsEntry, "status" | "timestamp">): Promise<CustomsEntry> {
        const entry: CustomsEntry = {
            ...data,
            timestamp: new Date().toISOString(),
            status: "FILED", // Initial status
        };

        // Persist to DynamoDB
        await customsService.fileEntry(entry);

        // Status updates must be driven by real operational actions or 
        // administrative tools (e.g. the "Time Travel" admin dashboard).
        // No automatic status-flipping in production-grade code.

        return entry;
    }

    public async getEntry(entryNumber: string): Promise<CustomsEntry | null> {
        return await customsService.getEntry(entryNumber);
    }

    public async getAllEntries(): Promise<CustomsEntry[]> {
        return await customsService.getAllEntries();
    }
}

export const registry = new FilingRegistry();
