import { novaClient } from "../nova/client";
import { PROMPTS } from "../nova/prompts";
import { vectorStore } from "@/lib/nova/vector-store";
import { type ExtractionData } from "./specialists";

export class ClaimsAgent {

    /**
     * Uses Nova Pro to draft a real claim email.
     */
    async draftClaim(
        shipmentId: string,
        discrepancy: { expected: number; actual: number; item: string },
        invoiceData: ExtractionData
    ): Promise<string> {
        console.log(`[ClaimsAgent] Generating real AI claim for Shipment ${shipmentId}`);

        // 1. RAG Enrichment: Check for past issues with this vendor
        let pastClaimsContext = "No history found.";
        try {
            const vendorName = invoiceData.vendor?.name || "";
            const results = await vectorStore.search(`shortage claim ${vendorName}`, 2);
            if (results.length > 0) {
                pastClaimsContext = results.map((r: any) => r.metadata.filename).join(", ");
            }
        } catch (e) {
            console.warn("[ClaimsAgent] RAG search failed, proceeding without history.");
        }

        // 2. Prepare Prompt
        const prompt = PROMPTS.claims_draft
            .replace("{{invoiceData}}", JSON.stringify(invoiceData, null, 2))
            .replace("{{discrepancy}}", JSON.stringify(discrepancy, null, 2))
            .replace("{{pastClaims}}", pastClaimsContext);

        // 3. Call Nova Pro
        try {
            const response = await novaClient.converse([{ role: "user", content: [{ text: prompt }] }], {
                system: "You are the Nova Claims Agent. Your output must be only the email content.",
                temperature: 0.1 // Keep it consistent and professional
            });

            return response.text;
        } catch (error) {
            console.error("[ClaimsAgent] Nova call failed", error);
            return `Manual Draft Required for Shipment ${shipmentId}. Error generating AI claim.`;
        }
    }
}

export const claimsAgent = new ClaimsAgent();
