import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { requireUserId } from "./lib/auth";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const ALLOWED_TRANSITIONS: Record<
  Doc<"requests">["status"],
  Doc<"requests">["status"][]
> = {
  pending: ["approved", "rejected"],
  approved: ["returned"],
  rejected: [],
  returned: [],
};

export const create = mutation({
  args: {
    toolId: v.id("tools"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { toolId, startDate, endDate }) => {
    const borrowerId = await requireUserId(ctx);
    const tool = await ctx.db.get(toolId);
    if (tool === null) {
      throw new ConvexError("Tool not found");
    }
    if (tool.ownerId === borrowerId) {
      throw new ConvexError("You cannot borrow your own tool");
    }
    if (endDate < startDate) {
      throw new ConvexError("End date must not be before start date");
    }
    // One day of slack: the client's "today" can be behind UTC.
    if (startDate < Date.now() - ONE_DAY_MS) {
      throw new ConvexError("Start date must not be in the past");
    }
    return await ctx.db.insert("requests", {
      toolId,
      borrowerId,
      startDate,
      endDate,
      status: "pending",
    });
  },
});

/** Requests made by the signed-in user. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const borrowerId = await requireUserId(ctx);
    const requests = await ctx.db
      .query("requests")
      .withIndex("by_borrower", (q) => q.eq("borrowerId", borrowerId))
      .order("desc")
      .collect();
    return await Promise.all(
      requests.map(async (request) => {
        const tool = await ctx.db.get(request.toolId);
        return { ...request, toolName: tool?.name ?? "Unknown tool" };
      }),
    );
  },
});

/** Requests made on tools owned by the signed-in user. */
export const listIncoming = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx);
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();
    const perTool = await Promise.all(
      tools.map(async (tool) => {
        const requests = await ctx.db
          .query("requests")
          .withIndex("by_tool", (q) => q.eq("toolId", tool._id))
          .collect();
        return requests.map((request) => ({
          ...request,
          toolName: tool.name,
        }));
      }),
    );
    return perTool.flat().sort((a, b) => b._creationTime - a._creationTime);
  },
});

/** Lets the tool's owner approve, reject or close a request. */
export const updateStatus = mutation({
  args: {
    id: v.id("requests"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("returned"),
    ),
  },
  handler: async (ctx, { id, status }) => {
    const userId = await requireUserId(ctx);
    const request = await ctx.db.get(id);
    if (request === null) {
      throw new ConvexError("Request not found");
    }
    const tool = await ctx.db.get(request.toolId);
    if (tool === null || tool.ownerId !== userId) {
      throw new ConvexError("Not authorized");
    }
    if (!ALLOWED_TRANSITIONS[request.status].includes(status)) {
      throw new ConvexError(`Cannot go from ${request.status} to ${status}`);
    }
    if (status === "approved") {
      const toolRequests = await ctx.db
        .query("requests")
        .withIndex("by_tool", (q) => q.eq("toolId", request.toolId))
        .collect();
      const overlaps = toolRequests.some(
        (other) =>
          other.status === "approved" &&
          other.startDate <= request.endDate &&
          request.startDate <= other.endDate,
      );
      if (overlaps) {
        throw new ConvexError("Tool is already lent on those dates");
      }
    }
    await ctx.db.patch(id, { status });
    await ctx.scheduler.runAfter(0, internal.webhooks.sendLoanStatusChanged, {
      requestId: id,
      toolId: request.toolId,
      toolName: tool.name,
      ownerId: tool.ownerId,
      borrowerId: request.borrowerId,
      startDate: request.startDate,
      endDate: request.endDate,
      previousStatus: request.status,
      status,
      occurredAt: Date.now(),
    });
  },
});
