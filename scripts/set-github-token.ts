import { SecretsManagerClient, PutSecretValueCommand, CreateSecretCommand } from "@aws-sdk/client-secrets-manager";

const REGION = process.env.AWS_REGION || "us-east-1";
const SECRET_NAME = "github-token";
const SECRET_VALUE = process.env.GITHUB_TOKEN;

const secrets = new SecretsManagerClient({ region: REGION });

async function setToken() {
    if (!SECRET_VALUE) {
        throw new Error("GITHUB_TOKEN is required to set the github-token secret");
    }
    console.log(`Updating Secret '${SECRET_NAME}'...`);
    try {
        // Try updating first
        try {
            await secrets.send(new PutSecretValueCommand({
                SecretId: SECRET_NAME,
                SecretString: SECRET_VALUE
            }));
            console.log("Secret Updated.");
        } catch (err: any) {
            if (err.name === 'ResourceNotFoundException') {
                console.log("Secret not found. Creating it...");
                await secrets.send(new CreateSecretCommand({
                    Name: SECRET_NAME,
                    SecretString: SECRET_VALUE
                }));
                console.log("Secret Created.");
            } else {
                throw err;
            }
        }
    } catch (error) {
        console.error("Error setting secret:", error);
    }
}

setToken();
