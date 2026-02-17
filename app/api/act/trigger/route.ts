import { NextRequest, NextResponse } from "next/server";
import { novaClient } from "@/lib/nova/client";

import { z } from "zod";

const actSchema = z.object({
    shipmentData: z.record(z.string(), z.any()), // Explicit string keys
});

import { rateLimiter } from "@/lib/rate-limit";
import { registry } from "@/lib/agents/registry";

// ...
export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const isAllowed = await rateLimiter.check(5, ip); // 5 acts per minute
        if (!isAllowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await request.json();
        const validation = actSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 });
        }

        const { shipmentData } = validation.data;

        // REAL AI ACT STEP:
        // We use Nova Pro to transform the analysis result into a strict "Customs Declaration" payload.
        // This is the "Acting" part—preparing the data for the external system.

        const prompt = `You are a Customs Broker Agent (Nova Act).
        
        Transform the following Shipment Analysis into a formal JSON payload for the US Customs "ACE" (Automated Commercial Environment) system.
        
        Input Data:
        ${JSON.stringify(shipmentData, null, 2)}
        
        Requirements:
        1. Generate a valid JSON object matching standard customs entry fields (Entry Number, Port Code, Importer, Bond Details).
        2. Assign a random 9-digit Entry Number if missing.
        3. Calculate Total Duty (assume 2.5% for HS 6106.10, 0% for others unless specified).
        4. Return ONLY the JSON.`;

        const response = await novaClient.converse([
            {
                role: "user",
                content: [{ text: prompt }]
            }
        ], {
            enableReasoning: true, // Nova Pro reasoning for Duty calculation
            reasoningEffort: "low",
            maxTokens: 1000
        });



        // ... inside POST ...

        // Extract JSON from response
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        const declaration = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (!declaration) {
            throw new Error("Failed to generate valid customs declaration");
        }

        // REAL ACTION: File to the Registry (Simulating CBP System persistence)
        // This makes the "Entry Number" a real, look-up-able record in our 'database'.

        const entryNumber = declaration.entryNumber || `E-${Math.floor(Math.random() * 1000000)}`;

        const filedEntry = await registry.fileEntry({
            entryNumber,
            filerCode: declaration.filerCode || "999",
            importer: declaration.importer || "Unknown Importer",
            portOfEntry: declaration.portCode || "4601",
            items: declaration.lineItems || [],
            totalDuty: declaration.totalDuty || 0,
            documents: ["invoice.pdf"] // placeholder for now
        });

        // The transaction ID is now the real Entry Number
        const transactionId = filedEntry.entryNumber;

        return NextResponse.json({
            success: true,
            transactionId,
            declaration: filedEntry,
            agent: "Nova Act",
            model: "us.amazon.nova-pro-v1:0"
        });

    } catch (error: unknown) {
        console.error("Act API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Filing failed" },
            { status: 500 }
        );
    }
}
