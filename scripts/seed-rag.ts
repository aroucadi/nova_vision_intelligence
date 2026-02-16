import { vectorStore } from "../lib/vector-store";
import { novaEmbeddings } from "../lib/nova/embeddings";

// Synthetic Shipment Data for RAG Testing
const SHIPMENTS = [
    {
        id: "SHIP-2024-001",
        filename: "invoice_SHENZHEN_TECH_001.pdf",
        text: `Commercial Invoice: SHIP-2024-001
    Vendor: Shenzhen Tech Mfg.
    Consignee: NovaVision Logistics LLC
    Date: 2024-01-15
    Origin: Shenzhen, CN
    Destination: Seattle, US
    Items:
    - 500x Wireless Security Cameras (HS 8525.80)
    - 500x Wall Mount Brackets (HS 7326.90)
    Total Value: $25,700.00
    Notes: Standard air freight. Compliant with FCC regulations.`
    },
    {
        id: "SHIP-2023-889",
        filename: "invoice_VIETNAM_TEXTILES_889.pdf",
        text: `Commercial Invoice: SHIP-2023-889
    Vendor: Hanoi Textile Group
    Consignee: Global Apparel Inc.
    Date: 2023-11-20
    Origin: Haiphong, VN
    Destination: Los Angeles, US
    Items:
    - 2000x Cotton T-Shirts (HS 6109.10)
    - 500x Denim Jeans (HS 6203.42)
    Total Value: $42,500.00
    Notes: Ocean freight. Certificate of Origin included for FTA benefits.`
    },
    {
        id: "SHIP-2023-550",
        filename: "invoice_GERMAN_AUTO_550.pdf",
        text: `Commercial Invoice: SHIP-2023-550
    Vendor: Bavaria Auto Parts GmbH
    Consignee: Detroit Motors Mfg
    Date: 2023-09-10
    Origin: Hamburg, DE
    Destination: Detroit, US
    Items:
    - 50x Automotive Transmission Gears (HS 8708.40)
    - 20x Brake Caliper Assemblies (HS 8708.30)
    Total Value: $125,000.00
    Notes: Priority air cargo. Heavy lift required.`
    },
    {
        id: "SHIP-2024-012",
        filename: "invoice_TAIWAN_SEMI_012.pdf",
        text: `Commercial Invoice: SHIP-2024-012
    Vendor: Taipei Semiconductor Corp
    Consignee: Silicon Valley Chips
    Date: 2024-02-01
    Origin: Taipei, TW
    Destination: San Francisco, US
    Items:
    - 10,000x Integrated Circuits / Microcontrollers (HS 8542.31)
    Total Value: $850,000.00
    Notes: Temperature controlled shipping required.`
    },
    {
        id: "SHIP-2024-045",
        filename: "invoice_BRAZIL_COFFEE_045.pdf",
        text: `Commercial Invoice: SHIP-2024-045
    Vendor: Santos Coffee Exporters
    Consignee: Seattle Roast House
    Date: 2024-03-10
    Origin: Santos, BR
    Destination: Seattle, US
    Items:
    - 500x Bags of Green Coffee Beans (HS 0901.11)
    Total Value: $60,000.00
    Notes: Organic certified. FDA Prior Notice filed.`
    }
];

async function seed() {
    console.log("🌱 Seeding Vector Store with synthetic shipments...");

    if (!process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
        console.warn("⚠️  NEXT_PUBLIC_S3_BUCKET_NAME is not set. Data will only be saved locally to /tmp.");
    }

    // Clear existing to avoid duplicates in this demo script
    await vectorStore.clear();

    for (const ship of SHIPMENTS) {
        console.log(`Processing: ${ship.id} (${ship.filename})...`);

        // Add to vector store (handles embedding generation + saving)
        await vectorStore.addDocument(ship.text, {
            filename: ship.filename,
            type: "invoice",
            vendor: ship.text.match(/Vendor: (.*)/)?.[1] || "Unknown",
            date: ship.text.match(/Date: (.*)/)?.[1] || "Unknown"
        });
    }

    console.log("✅ Seeding Complete! RAG Search is ready.");
}

// Run the seed function
seed().catch(console.error);
