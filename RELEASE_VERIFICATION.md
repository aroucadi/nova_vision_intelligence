# Release Verification

## Security Checks
- All `app/api/**/route.ts` endpoints require `x-demo-key` in demo mode or `x-api-key` in prod mode.
- `/api/sandbox/*`, `/admin`, `/demo`, `/analytics` are inaccessible when `APP_MODE=prod`.
- `fileUrl` fetching is restricted to `${NEXT_PUBLIC_S3_BUCKET_NAME}.s3.*.amazonaws.com` only.

## Functional Checks (Demo Mode)
- `/api/sandbox/customs` seed works and entries appear via `/api/act/registry`.
- `/api/sandbox/warehouse` seed works and items return via `/api/sandbox/warehouse`.
- `/api/upload` uploads to S3 and returns URL in configured bucket.
- `/api/agents/analyze` runs pipeline end-to-end on an uploaded file URL.
- `/api/act/trigger` files a declaration and returns `transactionId`.
- `/api/voice` returns a response for transcript-only requests.
- `/api/rag/sync` starts a KB ingestion job and returns `jobId`.
- `/api/intelligence/pulse` returns pulses or an empty list.

## Observability
- Each API call emits a JSON log line with keys: `event`, `route`, `mode`, `requestId`, `principal`, `status`, `durationMs`.
