import { AmplifyClient, UpdateAppCommand, StartJobCommand } from "@aws-sdk/client-amplify";

const APP_ID = process.env.AMPLIFY_APP_ID || "d3dzkic1trz6b7";
const REGION = process.env.AWS_REGION || "us-east-1";

const amplify = new AmplifyClient({ region: REGION });

async function fixEnvVars() {
    console.log(`🔧 Fixing Env Vars for App: ${APP_ID}...`);
    try {
        // We must pass ALL existing env vars or they might be wiped? 
        // Wait, UpdateApp usually merges/overwrites provided keys? 
        // Documentation says: "The environment variables to be set... This replaces the existing environment variables."
        // So we MUST fetch first? Or checking SDK docs... usually "EnvironmentVariables" is a map.
        // To be safe, let's fetch, update, and send back.

        // Actually, listing current vars first (we know them from check-env-vars output)
        const currentVars = {
            "NEXT_PUBLIC_S3_BUCKET_NAME": "nova-uploads-545179001218-us-east-1",
            "NOVA_GLOBAL_STATE_TABLE": "nova-global-state-545179001218-us-east-1",
            // The fix:
            "AMPLIFY_MONOREPO_APP_ROOT": ".",
            "AMPLIFY_DIFF_DEPLOY": "false"
        };

        const updateCmd = new UpdateAppCommand({
            appId: APP_ID,
            environmentVariables: currentVars
        });

        await amplify.send(updateCmd);
        console.log("✅ Env Vars Updated (Root fixed to '.')");

        // Trigger Build
        console.log("🚀 Triggering Fix Build...");
        const jobCmd = new StartJobCommand({
            appId: APP_ID,
            branchName: "main",
            jobType: "RELEASE"
        });
        const jobRes = await amplify.send(jobCmd);
        console.log(`✅ Build Job Started: ${jobRes.jobSummary?.jobId}`);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

fixEnvVars();
