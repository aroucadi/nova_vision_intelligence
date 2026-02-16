import { AmplifyClient, UpdateAppCommand, StartJobCommand } from "@aws-sdk/client-amplify";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const APP_ID = process.env.AMPLIFY_APP_ID || "d3dzkic1trz6b7";
const REPO_URL = "https://github.com/aroucadi/nova_vision_intelligence";
const REGION = process.env.AWS_REGION || "us-east-1";

const amplify = new AmplifyClient({ region: REGION });
const secrets = new SecretsManagerClient({ region: REGION });

async function forceConnect() {
    console.log(`🔧 Force Connecting App ${APP_ID} to GitHub...`);

    try {
        // 1. Get Token
        console.log("🔐 Fetching GitHub Token...");
        const secretParams = { SecretId: "github-token" };
        const secretResponse = await secrets.send(new GetSecretValueCommand(secretParams));
        const token = secretResponse.SecretString;

        if (!token) throw new Error("GitHub Token not found in Secrets Manager");

        // 2. Update App
        console.log(`🔗 Linking to: ${REPO_URL}`);
        const updateCmd = new UpdateAppCommand({
            appId: APP_ID,
            repository: REPO_URL,
            oauthToken: token,
            // Ensure build spec is respected if not already
            buildSpec: `
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
`
        });

        const updateRes = await amplify.send(updateCmd);
        console.log("✅ App Updated Successfully!");
        console.log(`- Repo: ${updateRes.app?.repository}`);

        // 3. Trigger Build
        console.log("🚀 Triggering Build...");
        const jobCmd = new StartJobCommand({
            appId: APP_ID,
            branchName: "main",
            jobType: "RELEASE"
        });
        const jobRes = await amplify.send(jobCmd);
        console.log(`✅ Build Job Started: ${jobRes.jobSummary?.jobId}`);

    } catch (error) {
        console.error("❌ Failed to connect:", error);
    }
}

forceConnect();
