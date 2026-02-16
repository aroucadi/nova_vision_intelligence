import { AmplifyClient, GetJobCommand } from "@aws-sdk/client-amplify";

const APP_ID = process.env.AMPLIFY_APP_ID || "d3dzkic1trz6b7";
const BRANCH = "main";
const JOB_ID = "2";
const REGION = process.env.AWS_REGION || "us-east-1";

const amplify = new AmplifyClient({ region: REGION });

async function diagnoseJob() {
    console.log(`🔍 Diagnosing Job #${JOB_ID} for App: ${APP_ID}...`);
    try {
        const command = new GetJobCommand({
            appId: APP_ID,
            branchName: BRANCH,
            jobId: JOB_ID
        });
        const response = await amplify.send(command);
        const job = response.job;

        if (!job) {
            console.error("❌ Job not found.");
            return;
        }

        console.log(`✅ Job Status: ${job.summary.status}`);
        console.log("📝 Steps:");
        job.steps.forEach(step => {
            console.log(`- [${step.stepName}] ${step.status} (${step.startTime} - ${step.endTime})`);
            if (step.status === 'FAILED') {
                console.log(`  👉 FAILURE REASON: ${step.statusReason}`);
                console.log(`  👉 ARTIFACT URL: ${step.artifactsUrl}`);
                console.log(`  👉 LOG URL: ${step.logUrl}`);
                console.log(`  👉 CONTEXT: ${step.context}`);
            }
        });

    } catch (error) {
        console.error("❌ Error fetching job:", error);
    }
}

diagnoseJob();
