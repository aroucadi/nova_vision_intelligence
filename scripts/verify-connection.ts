import { AmplifyClient, GetAppCommand } from "@aws-sdk/client-amplify";

const APP_ID = process.env.AMPLIFY_APP_ID || "d3dzkic1trz6b7";
const REGION = process.env.AWS_REGION || "us-east-1";

const amplify = new AmplifyClient({ region: REGION });

async function verifyConnection() {
    console.log(`🔍 Verifying App Config for: ${APP_ID}...`);
    try {
        const command = new GetAppCommand({ appId: APP_ID });
        const response = await amplify.send(command);

        const app = response.app;
        if (!app) {
            console.error("❌ App not found.");
            return;
        }

        console.log("✅ App Details:");
        console.log(`- Name: ${app.name}`);
        console.log(`- Repo: ${app.repository || "❌ NOT CONNECTED"}`);
        console.log(`- Platform: ${app.platform}`);
        console.log(`- Status: ${app.status}`);
        console.log(`- Created: ${app.createTime}`);
        console.log(`- Updated: ${app.updateTime}`);

    } catch (error) {
        console.error("❌ Error fetching app:", error);
    }
}

verifyConnection();
