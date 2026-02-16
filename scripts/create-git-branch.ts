import { AmplifyClient, CreateBranchCommand, StartJobCommand } from "@aws-sdk/client-amplify";

const APP_ID = process.env.AMPLIFY_APP_ID || "d3dzkic1trz6b7";
const BRANCH = "main";
const REGION = process.env.AWS_REGION || "us-east-1";

const amplify = new AmplifyClient({ region: REGION });

async function createGitBranch() {
    console.log(`🌱 Creating Git-Linked Branch '${BRANCH}' for App: ${APP_ID}...`);
    try {
        // 1. Create Branch
        const createCmd = new CreateBranchCommand({
            appId: APP_ID,
            branchName: BRANCH,
            stage: "PRODUCTION",
            enableAutoBuild: true
        });

        // Ignore "Already Exists" if we raced with a webhook
        try {
            await amplify.send(createCmd);
            console.log("✅ Branch Created Successfully.");
        } catch (err: any) {
            if (err.name === "BadRequestException" && err.message.includes("already exists")) {
                console.log("⚠️ Branch already exists (good!).");
            } else {
                throw err;
            }
        }

        // 2. Trigger Initial Build (to validate connection)
        console.log("🚀 Triggering Initial Git Build...");
        const jobCmd = new StartJobCommand({
            appId: APP_ID,
            branchName: BRANCH,
            jobType: "RELEASE"
        });
        const jobRes = await amplify.send(jobCmd);
        console.log(`✅ Build Job Started: ${jobRes.jobSummary?.jobId}`);
        console.log(`   Status: ${jobRes.jobSummary?.status}`);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

createGitBranch();
