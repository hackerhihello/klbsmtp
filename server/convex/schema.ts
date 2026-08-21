import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    apiKey: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    dailyLimit: v.number(),
    status: v.string(),
    isBlocked: v.boolean(),
    allowOverLimitOverride: v.boolean(),
    lastHalfAlertAt: v.optional(v.number()),
    lastFullAlertAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_apiKey", ["apiKey"])
    .index("by_name", ["name"]),

  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    role: v.string(),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]),

  emailLogs: defineTable({
    orgId: v.string(),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
    status: v.string(),
    errorMessage: v.optional(v.string()),
    attempts: v.number(),
    attachments: v.any(), // Array of attachment objects
    metadata: v.optional(v.any()),
    timestamp: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_org_and_timestamp", ["orgId", "timestamp"])
    .index("by_org_status_timestamp", ["orgId", "status", "timestamp"]),
});
