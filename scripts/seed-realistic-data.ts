
import dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// Load .env.local if it exists (Next.js standard)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // Fallback to .env

import puppeteer from 'puppeteer-core';
import { faker } from '@faker-js/faker';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

// --- CONFIG ---
const INVOICE_COUNT = 50;
const YEARS_BACK = 2;
const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
const CUSTOMS_TABLE = process.env.NOVA_CUSTOMS_TABLE || "NovaCustomsTable";
const WAREHOUSE_TABLE = process.env.NOVA_WAREHOUSE_TABLE || "NovaWarehouseTable";
const REGION = process.env.AWS_REGION || "us-east-1";

if (!BUCKET_NAME) {
    console.error("❌ Stats: Missing NEXT_PUBLIC_S3_BUCKET_NAME in .env");
    process.exit(1);
}

// --- AWS CLIENTS ---
const s3 = new S3Client({ region: REGION });
const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// --- TYPES ---
interface Product {
    sku: string;
    name: string;
    description: string;
    price: number;
    htsus: string;
}

interface Client {
    name: string;
    address: string;
    email: string;
}

// --- GENERATORS ---
const generateProducts = (count: number): Product[] => {
    const products: Product[] = [];
    for (let i = 0; i < count; i++) {
        products.push({
            sku: faker.string.alphanumeric(8).toUpperCase(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price({ min: 10, max: 2000 })),
            htsus: faker.string.numeric(8), // Mock HTSUS code
        });
    }
    return products;
};

const generateClients = (count: number): Client[] => {
    const clients: Client[] = [];
    for (let i = 0; i < count; i++) {
        clients.push({
            name: faker.company.name(),
            address: faker.location.streetAddress(true),
            email: faker.internet.email(),
        });
    }
    return clients;
};

// --- HTML TEMPLATE ---
const renderInvoiceHTML = (invoiceId: string, date: Date, client: Client, items: any[], total: number) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Helvetica, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
        .invoice-details { text-align: right; }
        .client-info { margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; border-bottom: 1px solid #ddd; padding: 10px 0; color: #666; }
        td { padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 60px; font-size: 12px; color: #999; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Nova Logistics Inc.</div>
        <div class="invoice-details">
            <h1>INVOICE</h1>
            <p>#${invoiceId}</p>
            <p>Date: ${date.toLocaleDateString()}</p>
        </div>
    </div>

    <div class="client-info">
        <h3>Bill To:</h3>
        <p><strong>${client.name}</strong></p>
        <p>${client.address}</p>
        <p>${client.email}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${items.map(item => `
            <tr>
                <td>${item.product.name}</td>
                <td>${item.product.sku}</td>
                <td>${item.quantity}</td>
                <td>$${item.product.price.toFixed(2)}</td>
                <td>$${(item.quantity * item.product.price).toFixed(2)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="total">
        Total: $${total.toFixed(2)}
    </div>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>Payment due within 30 days.</p>
    </div>
</body>
</html>
`;

// --- MAIN SCRIPT ---
async function main() {
    console.log("🚀 Starting Realistic Data Seeding...");
    console.log(`🎯 Target: ${INVOICE_COUNT} invoices over ${YEARS_BACK} years`);

    // 0. Load Vector Store
    let vectorStore: any;
    try {
        const module = await import('../lib/vector-store');
        vectorStore = module.vectorStore;
        console.log("✅ Vector Store Loaded");
    } catch (e: any) {
        console.error("❌ Failed to load Vector Store module:", e);
        process.exit(1);
    }

    // 1. Generate Base Data
    const products = generateProducts(20);
    const clients = generateClients(10);
    console.log(`✅ Generated ${products.length} Products and ${clients.length} Clients`);

    // 2. Launch Puppeteer (Core)
    // Try to find a local browser (Edge or Chrome)
    const potentialPaths = [
        process.env.CHROME_PATH,
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];

    const executablePath = potentialPaths.find(p => p && fs.existsSync(p));

    if (!executablePath) {
        console.error("❌ Browser not found. Please set CHROME_PATH to your Edge/Chrome executable.");
        process.exit(1);
    }

    console.log(`🌐 Using Browser: ${executablePath}`);

    const browser = await puppeteer.launch({
        executablePath,
        channel: 'chrome',
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    // 3. Generate Invoices
    const warehouseBatch: any[] = [];
    const customsBatch: any[] = [];

    for (let i = 0; i < INVOICE_COUNT; i++) {
        const client = faker.helpers.arrayElement(clients);
        const invoiceDate = faker.date.past({ years: YEARS_BACK });
        const invoiceId = `INV-${dateToId(invoiceDate)}-${faker.string.numeric(4)}`;

        // Select 1-5 random products per invoice
        const invoiceItems = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 5 }))
            .map(product => ({
                product,
                quantity: faker.number.int({ min: 10, max: 100 })
            }));

        const totalAmount = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

        // A. Generate HTML & PDF
        const html = renderInvoiceHTML(invoiceId, invoiceDate, client, invoiceItems, totalAmount);
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ format: 'A4' });

        // B. Upload to S3
        const s3Key = `invoices/${dateToId(invoiceDate)}/${invoiceId}.pdf`;
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            Metadata: {
                client: client.name,
                invoiceId: invoiceId,
                date: invoiceDate.toISOString()
            }
        }));
        console.log(`📄 Create PDF: ${s3Key}`);

        // B2. Index in Vector Store
        try {
            const summary = `Invoice #${invoiceId}
Date: ${invoiceDate.toDateString()}
Client: ${client.name} (${client.email})
Items:
${invoiceItems.map(i => `- ${i.product.name} (Qty: ${i.quantity})`).join('\n')}
Total: $${totalAmount.toFixed(2)}`;

            await vectorStore.addDocument(summary, {
                type: 'invoice',
                invoiceId,
                client: client.name,
                s3Key,
                date: invoiceDate.toISOString()
            });
        } catch (error: any) {
            if (error.name === 'ValidationException' || error.name === 'AccessDeniedException') {
                console.warn(`⚠️  RAG Indexing Skipped (Model Unavailable) - Invoice Generated via Database only.`);
            } else {
                console.error(`❌ Failed to index invoice ${invoiceId}:`, error);
            }
        }

        // C. Prepare Warehouse Data (Stock Update - simulated "Inbound")
        // In a real app, this would be a transaction. Here we just seed stock levels.
        invoiceItems.forEach(item => {
            warehouseBatch.push({
                sku: item.product.sku,
                name: item.product.name,
                quantity: item.quantity, // Just replacing/setting quantity for demo simplicity
                location: `Z-${faker.string.numeric(2)}-${faker.string.alphanumeric(1).toUpperCase()}`,
                status: "IN_STOCK",
                lastUpdated: invoiceDate.toISOString()
            });
        });

        // D. Prepare Customs Entry (Linked to this Invoice)
        const entryStatus = i < 5 ? "HELD" : (i < 10 ? "FILED" : "RELEASED"); // Mix statuses
        customsBatch.push({
            entryNumber: `${faker.string.numeric(3)}-${faker.string.numeric(7)}-${faker.string.numeric(1)}`,
            filerCode: "999",
            importer: client.name,
            portOfEntry: faker.helpers.arrayElement(["LAX", "NYC", "CHI", "MIA"]),
            timestamp: invoiceDate.toISOString(),
            status: entryStatus,
            items: invoiceItems.map(item => ({
                description: item.product.name,
                htsus: item.product.htsus,
                value: item.product.price * item.quantity,
                quantity: item.quantity,
                unit_price: item.product.price
            })),
            totalDuty: totalAmount * 0.05, // Mock 5% duty
            documents: [`s3://${BUCKET_NAME}/${s3Key}`]
        });
    }

    await browser.close();
    console.log("✅ PDF Generation Complete");

    // 4. Batch Write to DynamoDB (Chunked by 25)
    // Note: Warehouse items might duplicate SKU, so we dedupe by taking the latest
    const uniqueWarehouseItems = Array.from(new Map(warehouseBatch.map(item => [item.sku, item])).values());

    console.log(`💾 Writing ${uniqueWarehouseItems.length} Warehouse Items...`);
    await batchWrite(WAREHOUSE_TABLE, uniqueWarehouseItems);

    console.log(`💾 Writing ${customsBatch.length} Customs Entries...`);
    await batchWrite(CUSTOMS_TABLE, customsBatch);

    console.log("✨ Seeding Complete!");
}


// Helper: Dates to ID string (YYYYMMDD)
function dateToId(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
}

// Helper: Batch Write to DynamoDB
async function batchWrite(tableName: string, items: any[]) {
    const chunks = [];
    for (let i = 0; i < items.length; i += 25) {
        chunks.push(items.slice(i, i + 25));
    }

    for (const chunk of chunks) {
        const putRequests = chunk.map(item => ({
            PutRequest: { Item: item }
        }));

        await docClient.send(new BatchWriteCommand({
            RequestItems: {
                [tableName]: putRequests
            }
        }));
    }
}

main().catch(err => console.error(err));
