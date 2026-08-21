import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createLog = mutation({
  args: {
    orgId: v.string(),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
    status: v.string(),
    errorMessage: v.optional(v.string()),
    attempts: v.number(),
    attachments: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("emailLogs", {
      orgId: args.orgId,
      email: args.email,
      subject: args.subject,
      body: args.body,
      status: args.status,
      errorMessage: args.errorMessage,
      attempts: args.attempts,
      attachments: args.attachments || [],
      metadata: args.metadata,
      timestamp: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const listLogs = query({
  args: {
    orgId: v.optional(v.string()),
    status: v.optional(v.string()),
    email: v.optional(v.string()),
    from: v.optional(v.number()),
    to: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db.query("emailLogs");

    // Sort index
    let logs = [];
    if (args.orgId) {
      logs = await queryBuilder
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();
    } else {
      logs = await queryBuilder.collect();
    }

    // Apply filters
    if (args.status) {
      logs = logs.filter((l) => l.status === args.status);
    }
    if (args.email) {
      const e = args.email.toLowerCase();
      logs = logs.filter((l) => l.email.toLowerCase().includes(e));
    }
    if (args.from) {
      logs = logs.filter((l) => l.timestamp >= args.from!);
    }
    if (args.to) {
      logs = logs.filter((l) => l.timestamp <= args.to!);
    }

    // Sort by createdAt desc
    logs.sort((a, b) => b.createdAt - a.createdAt);

    // Slice limit
    const lim = args.limit || 500;
    return logs.slice(0, lim);
  },
});

export const getTodayCount = query({
  args: {
    orgId: v.string(),
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("emailLogs")
      .withIndex("by_org_and_timestamp", (q) =>
        q.eq("orgId", args.orgId).gte("timestamp", args.start).lt("timestamp", args.end)
      )
      .collect();
    return logs.length;
  },
});

export const getTodayCountsByOrgs = query({
  args: {
    start: v.number(),
    end: v.number(),
    orgIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("emailLogs")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.start).lt("timestamp", args.end)
      )
      .collect();

    const counts: Record<string, number> = {};
    for (const orgId of args.orgIds) {
      counts[orgId] = 0;
    }

    for (const log of logs) {
      if (args.orgIds.includes(log.orgId)) {
        counts[log.orgId] = (counts[log.orgId] || 0) + 1;
      }
    }
    return counts;
  },
});

export const getTodayCountAllOrgs = query({
  args: {
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("emailLogs")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.start).lt("timestamp", args.end)
      )
      .collect();

    // Sum success counts (only count successful emails sent)
    const successLogs = logs.filter((l) => l.status === "success");
    return successLogs.length;
  },
});

export const countLogsByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("emailLogs")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    return logs.length;
  },
});

export const getDailyReportSummary = query({
  args: { since: v.number() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("emailLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", args.since))
      .collect();

    const summary: Record<string, Record<string, number>> = {};
    for (const log of logs) {
      if (!summary[log.orgId]) {
        summary[log.orgId] = {};
      }
      summary[log.orgId][log.status] = (summary[log.orgId][log.status] || 0) + 1;
    }
    return summary;
  },
});

