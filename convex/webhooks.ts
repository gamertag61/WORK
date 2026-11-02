import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const MAX_ATTEMPTS = 4;
const BASE_RETRY_DELAY_MS = 30_000;
const REQUEST_TIMEOUT_MS = 10_000;

const requestStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("returned"),
);

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set in the Convex deployment`);
  }
  return value;
}

/** HMAC-SHA256 of `message` as lowercase hex. */
async function signHmacSha256(secret: string, message: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/**
 * Sends a signed webhook to n8n. Scheduled by `requests.updateStatus`, so it
 * only runs if the status change committed.
 *
 * The signature covers `<timestamp>.<raw body>`: n8n must recompute it over the
 * exact bytes received and reject stale timestamps to block replays.
 */
export const sendLoanStatusChanged = internalAction({
  args: {
    requestId: v.id("requests"),
    toolId: v.id("tools"),
    toolName: v.string(),
    ownerId: v.string(),
    borrowerId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    previousStatus: requestStatus,
    status: requestStatus,
    occurredAt: v.number(),
    attempt: v.optional(v.number()),
  },
  handler: async (ctx, { attempt = 1, occurredAt, ...data }) => {
    const url = requireEnv("N8N_WEBHOOK_URL");
    const secret = requireEnv("N8N_WEBHOOK_SECRET");

    // Statuses only move forward, so this ID is stable across retries and lets
    // the receiver deduplicate.
    const eventId = `${data.requestId}:${data.status}`;
    const body = JSON.stringify({
      id: eventId,
      type: "loan_request.status_changed",
      occurredAt,
      data,
    });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await signHmacSha256(secret, `${timestamp}.${body}`);

    let response: Response | undefined;
    let failure = "";
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LendLoop-Event-Id": eventId,
          "X-LendLoop-Timestamp": timestamp,
          "X-LendLoop-Signature": `sha256=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
    }

    if (response?.ok) {
      return;
    }
    if (response) {
      failure = `n8n responded ${response.status}`;
      // A 4xx will not fix itself on retry (bad signature), except a 404: n8n
      // answers that while it starts, before it registers its webhooks.
      if (response.status < 500 && response.status !== 404) {
        throw new Error(`${failure} for event ${eventId}`);
      }
    }

    if (attempt >= MAX_ATTEMPTS) {
      throw new Error(
        `Gave up on event ${eventId} after ${attempt} attempts: ${failure}`,
      );
    }
    await ctx.scheduler.runAfter(
      BASE_RETRY_DELAY_MS * 2 ** (attempt - 1),
      internal.webhooks.sendLoanStatusChanged,
      { ...data, occurredAt, attempt: attempt + 1 },
    );
  },
});
