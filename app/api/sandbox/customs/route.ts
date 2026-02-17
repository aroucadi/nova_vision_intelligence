import { NextRequest, NextResponse } from "next/server";
import { customsService } from "@/lib/services/customs-service";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (id) {
            const entry = await customsService.getEntry(id);
            if (!entry) {
                return NextResponse.json({ error: "Entry not found" }, { status: 404 });
            }
            return NextResponse.json(entry);
        } else {
            const entries = await customsService.getAllEntries();
            return NextResponse.json({ entries });
        }
    } catch (error: unknown) {
        console.error("Customs API Error:", error);
        return NextResponse.json({ error: "Failed to fetch customs data" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Simple validation or schema check here if needed
        const newEntry = await customsService.fileEntry(body);
        return NextResponse.json(newEntry);
    } catch (error: unknown) {
        console.error("Customs API Error:", error);
        return NextResponse.json({ error: "Failed to file entry" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { entryNumber, status } = body;

        if (!entryNumber || !status) {
            return NextResponse.json({ error: "Missing entryNumber or status" }, { status: 400 });
        }

        await customsService.updateStatus(entryNumber, status);
        return NextResponse.json({ success: true, entryNumber, status });
    } catch (error: unknown) {
        console.error("Customs API Error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
