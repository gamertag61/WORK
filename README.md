# LendLoop

Next.js (App Router), Clerk, Convex and n8n.

## Run the app

Create `.env.local`, then run these in two terminals:

```bash
npx convex dev
npm run dev
```

## Automation with n8n

Every request status change sends a signed webhook from Convex to n8n.

1. Start n8n at http://localhost:5678 (requires Docker and `N8N_WEBHOOK_SECRET` in `.env.local`):

   ```bash
   docker compose --env-file .env.local up -d
   ```

2. In n8n, import `n8n-workflow-export.json` and publish the workflow.

3. Set the same values in Convex:

   ```bash
   npx convex env set N8N_WEBHOOK_SECRET <same value as .env.local>
   npx convex env set N8N_WEBHOOK_URL http://localhost:5678/webhook/lendloop-loan-status
   ```

### Verifying a webhook

The `X-LendLoop-Signature` header is `sha256=<hex>`, the HMAC-SHA256 of
`<X-LendLoop-Timestamp>.<raw body>` using `N8N_WEBHOOK_SECRET`. Recompute it over
the exact bytes received, compare in constant time, and reject timestamps older
than 5 minutes. Retries reuse the `id` field (also in `X-LendLoop-Event-Id`), so
use it to deduplicate.
