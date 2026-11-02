import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/** Returns the signed-in user's Clerk ID, or throws if there is no session. */
export async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError("Not authenticated");
  }
  return identity.subject;
}
