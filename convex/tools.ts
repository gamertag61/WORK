import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireUserId } from "./lib/auth";

/** Returns the tool, or throws unless the signed-in user owns it. */
async function requireOwnedTool(ctx: MutationCtx, toolId: Id<"tools">) {
  const userId = await requireUserId(ctx);
  const tool = await ctx.db.get(toolId);
  if (tool === null) {
    throw new ConvexError("Tool not found");
  }
  if (tool.ownerId !== userId) {
    throw new ConvexError("Not authorized");
  }
  return tool;
}

/** Public catalog: works without a session and never exposes owner IDs. */
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    const result = await ctx.db
      .query("tools")
      .order("desc")
      .paginate(paginationOpts);
    return {
      ...result,
      page: result.page.map(({ ownerId, ...tool }) => ({
        ...tool,
        isMine: ownerId === identity?.subject,
      })),
    };
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("tools") },
  handler: async (ctx, { id }) => {
    await requireUserId(ctx);
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    condition: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // The owner always comes from the session, never from the client.
    const ownerId = await requireUserId(ctx);
    return await ctx.db.insert("tools", { ...args, ownerId });
  },
});

export const update = mutation({
  args: {
    id: v.id("tools"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    condition: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireOwnedTool(ctx, id);
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("tools") },
  handler: async (ctx, { id }) => {
    await requireOwnedTool(ctx, id);
    const requests = await ctx.db
      .query("requests")
      .withIndex("by_tool", (q) => q.eq("toolId", id))
      .collect();
    if (requests.some((request) => request.status === "approved")) {
      throw new ConvexError("Tool has an active loan");
    }
    // Delete the tool's requests too, so none points at a missing tool.
    await Promise.all(requests.map((request) => ctx.db.delete(request._id)));
    await ctx.db.delete(id);
  },
});
