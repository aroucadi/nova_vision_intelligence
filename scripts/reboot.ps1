$ErrorActionPreference = "Stop"

Write-Host "🚧 STARTING FULL SYSTEM REBOOT (DOWN -> UP)" -ForegroundColor Yellow

# 1. DESTROY INFRASTRUCTURE
Write-Host "🔥 Destroying Infrastructure (CDK)..." -ForegroundColor Red
Set-Location "../nova-vision-intelligence-infra"
npm run cdk -- destroy --all --force

# 2. DEPLOY INFRASTRUCTURE
Write-Host "🏗️  Redeploying Infrastructure (CDK)..." -ForegroundColor Cyan
npm run cdk -- deploy --all --require-approval never --outputs-file ../nova-vision-intelligence/deployment-outputs.json

# 3. PARSE OUTPUTS & UPDATE ENV
Write-Host "📝 Updating Application Configuration..." -ForegroundColor Green
$outputs = Get-Content "../nova-vision-intelligence/deployment-outputs.json" | ConvertFrom-Json
$bucket = $outputs.DataStack.NovaUploadsBucketName
$appId = $outputs.FrontendStack.AmplifyAppId
$table = $outputs.DataStack.NovaGlobalStateTableName

# Update Environment Variables for the script session
$env:NEXT_PUBLIC_S3_BUCKET_NAME = $bucket
$env:AMPLIFY_APP_ID = $appId
$env:NOVA_GLOBAL_STATE_TABLE = $table
$env:AWS_REGION = "us-east-1"

Write-Host "   -> Bucket: $bucket"
Write-Host "   -> App ID: $appId"

Set-Location "../nova-vision-intelligence"

# 4. DEPLOY APP CODE
Write-Host "🚀 Deploying Frontend Code..." -ForegroundColor Magenta
npm run deploy:cloud

# 5. SEED RAG
Write-Host "🌱 Seeding RAG Database..." -ForegroundColor Green
# Using 'continue' implementation incase permissions are still missing
try {
    npx tsx scripts/seed-rag.ts
} catch {
    Write-Warning "RAG Seeding failed (likely permissions). Skipping."
}

Write-Host "✅ SYSTEM REBOOT COMPLETE." -ForegroundColor Green
Write-Host "🌍 App should be live shortly at Amplify Console."
