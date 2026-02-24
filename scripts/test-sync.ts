import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
async function testSync() {
    const { kbService } = await import("../lib/services/kb-service");
    console.log("Testing Knowledge Base Sync...");
    try {
        const jobId = await kbService.sync();
        console.log("✅ Sync started successfully! Job ID:", jobId);
    } catch (error: any) {
        console.error("❌ Sync failed with error details:");
        console.log(`Name: ${error.name}`);
        console.log(`Message: ${error.message}`);
        if (error.$metadata) console.log(`Metadata: ${JSON.stringify(error.$metadata, null, 2)}`);
    }
}

testSync().catch(console.error);
