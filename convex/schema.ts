import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tools: defineTable({
    name: v.string(),
    category: v.string(),
    condition: v.string(),
    description: v.string(),
    // Clerk user ID (identity.subject).
    ownerId: v.string(),
  }).index("by_owner", ["ownerId"]),

  requests: defineTable({
    toolId: v.id("tools"),
    // Clerk user ID (identity.subject).
    borrowerId: v.string(),
    // Unix timestamps in milliseconds.
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("returned"),
    ),
  })
    .index("by_tool", ["toolId"])
    .index("by_borrower", ["borrowerId"]),
});
