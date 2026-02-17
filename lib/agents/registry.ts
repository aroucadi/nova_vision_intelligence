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

        // Simulate "Processing" logic (e.g. risk assessment delay)
        // In a real system, this would happen via a background Lambda stream event.
        // For the demo, we'll optimistically schedule a release if it's a valid entry.

        // We do NOT simulate the timeout here anymore for the status update,
        // because we want the Admin Dashboard's "Time Travel" feature to handle approvals.
        // OR we can keep it for the "Happy Path" demo.
        // Let's keep it for the "Happy Path" but make it checkable.

        setTimeout(async () => {
            // Re-fetch to ensure we don't overwrite manual changes
            const current = await customsService.getEntry(entry.entryNumber);
            if (current && current.status === "FILED") {
                await customsService.updateStatus(entry.entryNumber, "RELEASED");
            }
        }, 5000); // 5 seconds processing time

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
