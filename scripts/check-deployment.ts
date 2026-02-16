import { AmplifyClient, ListJobsCommand } from "@aws-sdk/client-amplify";

const APP_ID = process.env.AMPLIFY_APP_ID || "d3dzkic1trz6b7";
const BRANCH = "main";
const REGION = process.env.AWS_REGION || "us-east-1";

const amplify = new AmplifyClient({ region: REGION });

async function checkJobs() {
    console.log(`🔍 Checking Jobs for App: ${APP_ID}, Branch: ${BRANCH}...`);
    try {
        const command = new ListJobsCommand({
            appId: APP_ID,
            branchName: BRANCH,
            maxResults: 1
        });
        const response = await amplify.send(command);

        if (!response.jobSummaries || response.jobSummaries.length === 0) {
            console.log("❌ No Jobs found.");
            return;
        }

        const job = response.jobSummaries[0];
        console.log("✅ Latest Job:");
        console.log(`- Job ID: ${job.jobId}`);
        console.log(`- Status: ${job.status}`);
        console.log(`- Start Time: ${job.startTime}`);
        console.log(`- Commit: ${job.commitMessage}`);

    } catch (error) {
        console.error("❌ Error listing jobs:", error);
    }
}

checkJobs();
