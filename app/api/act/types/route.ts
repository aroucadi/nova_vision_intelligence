import { NextResponse } from "next/server";

export async function GET() {
    // Return static workflow types directly (Ported from legacy python service)
    return NextResponse.json({
        types: [
            {
                id: "data_collection",
                name: "Web Data Collection",
                description: "Extract structured data from any website — pricing, reviews, product listings.",
                icon: "Database",
                example_url: "https://example.com/products",
            },
            {
                id: "form_fill",
                name: "Smart Form Filler",
                description: "Auto-fill web forms using data extracted from your uploaded documents.",
                icon: "FileInput",
                example_url: "https://example.com/apply",
            },
            {
                id: "qa_test",
                name: "QA Testing",
                description: "Automated quality assurance — check page load, UI elements, accessibility, links.",
                icon: "ShieldCheck",
                example_url: "https://example.com",
            },
        ],
    });
}
