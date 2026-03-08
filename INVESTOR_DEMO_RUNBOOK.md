# Investor Demo Runbook (NovaVision Intelligence)

## Demo Mode Prerequisites
- Set `APP_MODE=demo`
- Set `NEXT_PUBLIC_APP_MODE=demo`
- Set `DEMO_API_KEY` (required in production runtime)
- Set `NEXT_PUBLIC_S3_BUCKET_NAME` to your demo bucket
- Set `NEXT_PUBLIC_SAMPLE_INVOICE_URL` to an HTTPS URL in your demo bucket
- Set `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Set `NOVA_CUSTOMS_TABLE`, `NOVA_WAREHOUSE_TABLE`, `NOVA_GLOBAL_STATE_TABLE`
- Set `KNOWLEDGE_BASE_ID`, `DATA_SOURCE_ID`

## How To Call APIs (Demo Auth)
- All API requests must include `x-demo-key: <DEMO_API_KEY>`

## One-Time Setup (Seed Demo Data)
- Seed customs registry:
  - `POST /api/sandbox/customs` with JSON `{ "action": "seed" }`
- Seed warehouse inventory:
  - `POST /api/sandbox/warehouse` with JSON `{ "action": "seed" }`

## Live Demo Flow (Recommended)
1. Open `/admin` and confirm entries/inventory appear (demo mode only).
2. Open `/clearance`.
3. Click “Try Sample Invoice” (appears only when `NEXT_PUBLIC_SAMPLE_INVOICE_URL` is set).
4. Run the multi-agent analysis pipeline.
5. Trigger the Act flow to file the entry.
6. Open `/warehouse` with the `contextId` equal to the filed `entryNumber`.
7. Use voice input to report a short count and show discrepancy → claim drafting.
8. Open `/dashboard` to show live registry sync and intelligence pulse.

## Troubleshooting
- `401 Unauthorized`: missing/incorrect `x-demo-key` header.
- `403 Access denied: Unauthorized file source`: `fileUrl` must be in your configured S3 bucket host.
- `500 Server misconfiguration`: missing required environment variables (API key, bucket, KB ids).
- `429 Too many requests`: rate limits exceeded; wait and retry.

## Demo Safety Notes
- Sandbox routes (`/api/sandbox/*`) and demo/admin/analytics pages are accessible only when `APP_MODE=demo`.
- File fetching is restricted to your S3 bucket to prevent SSRF.
