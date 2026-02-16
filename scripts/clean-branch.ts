import { AmplifyClient, DeleteBranchCommand } from "@aws-sdk/client-amplify";

const APP_ID = process.env.AMPLIFY_APP_ID || "d3dzkic1trz6b7";
const BRANCH = "main";
const REGION = process.env.AWS_REGION || "us-east-1";

const amplify = new AmplifyClient({ region: REGION });

async function cleanBranch() {
    console.log(`🗑️ Deleting Branch '${BRANCH}' for App: ${APP_ID}...`);
    try {
        const command = new DeleteBranchCommand({
            appId: APP_ID,
            branchName: BRANCH
        });

        await amplify.send(command);
        console.log("✅ Branch Deleted Successfully.");
        console.log("👉 Now run 'force-connect.ts' to link GitHub.");

    } catch (error) {
        console.error("❌ Error deleting branch:", error);
    }
}

cleanBranch();
