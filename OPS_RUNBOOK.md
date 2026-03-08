# Ops Runbook

## Core Signals
- API JSON logs: `event=api`, with `route`, `mode`, `requestId`, `status`, `durationMs`
- Pipeline state: `pipelineId` persisted via state manager (DynamoDB in prod)

## Common Incidents
### Elevated 401/403
- Confirm `APP_MODE` and expected auth mechanism (demo cookie vs prod key).
- Confirm `DEMO_API_KEY`/`API_KEY` is present in runtime environment.
- Validate the request is coming from the expected origin and cookies are set in demo mode.

### Elevated 429
- Identify offending `principal` in logs and confirm rate limits per endpoint.
- For prod, confirm `NOVA_GLOBAL_STATE_TABLE` is set so rate limiting is durable.

### Increased 5xx in Analyze/Query
- Check for `fileUrl` host policy violations and presigned URL expiry.
- Validate Bedrock runtime access and region configuration.

### RAG Not Returning Results
- Confirm `KNOWLEDGE_BASE_ID` and `DATA_SOURCE_ID` are configured.
- Trigger `/api/rag/sync` and watch ingestion job completion.
- In hybrid mode, verify local store indexing still returns results.

## Safe Operational Practices
- Do not log document contents or secrets; logs redact common secret keys.
- Keep S3 buckets private (block public access) and use presigned reads where needed.
