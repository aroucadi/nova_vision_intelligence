const { OpenSearchServerlessClient, ListCollectionsCommand } = require("@aws-sdk/client-opensearchserverless");

async function main() {
    const client = new OpenSearchServerlessClient({ region: "us-east-1" });
    try {
        const data = await client.send(new ListCollectionsCommand({}));
        console.log(JSON.stringify(data.collectionSummaries, null, 2));
    } catch (err) {
        console.error(err);
    }
}

main();
