import { AmplifyClient, GetAppCommand } from "@aws-sdk/client-amplify";

const APP_ID = process.env.AMPLIFY_APP_ID || "d3dzkic1trz6b7";
const REGION = process.env.AWS_REGION || "us-east-1";

const amplify = new AmplifyClient({ region: REGION });

async function checkEnvVars() {
    console.log(`🔍 Checking Environment Variables for App: ${APP_ID}...`);
    try {
        const command = new GetAppCommand({ appId: APP_ID });
        const response = await amplify.send(command);

        const app = response.app;
        if (!app) {
            console.error("❌ App not found.");
            return;
        }

        console.log("✅ Environment Variables:");
        if (app.environmentVariables) {
            Object.entries(app.environmentVariables).forEach(([key, value]) => {
                console.log(`- ${key}: ${value}`);
            });
        } else {
            console.log("⚠️ No Environment Variables found.");
        }

    } catch (error) {
        console.error("❌ Error fetching app:", error);
    }
}

checkEnvVars();
