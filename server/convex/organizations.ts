import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrg = mutation({
  args: {
    name: v.string(),
    apiKey: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    dailyLimit: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existing) {
      throw new Error(`Organization name "${args.name}" is already taken.`);
    }

    const id = await ctx.db.insert("organizations", {
      name: args.name,
      apiKey: args.apiKey,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      dailyLimit: args.dailyLimit,
      status: args.status,
      isBlocked: false,
      allowOverLimitOverride: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const getOrgByApiKey = query({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_apiKey", (q) => q.eq("apiKey", args.apiKey))
      .unique();
  },
});

export const getOrgById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      // Convex requires parsing the Id if it's a valid Id object
      const normalizedId = ctx.db.normalizeId("organizations", args.id);
      if (!normalizedId) return null;
      return await ctx.db.get(normalizedId);
    } catch {
      return null;
    }
  },
});

export const listOrgs = query({
  args: {
    status: v.optional(v.string()),
    blocked: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let orgs = await ctx.db.query("organizations").collect();

    if (args.status) {
      orgs = orgs.filter((o) => o.status === args.status);
    }
    if (args.blocked !== undefined) {
      orgs = orgs.filter((o) => o.isBlocked === args.blocked);
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      orgs = orgs.filter(
        (o) =>
          o.name.toLowerCase().includes(s) ||
          (o.contactName && o.contactName.toLowerCase().includes(s)) ||
          (o.contactEmail && o.contactEmail.toLowerCase().includes(s))
      );
    }

    // Sort by createdAt desc
    orgs.sort((a, b) => b.createdAt - a.createdAt);
    return orgs;
  },
});

export const updateOrgControls = mutation({
  args: {
    id: v.string(),
    isBlocked: v.optional(v.boolean()),
    allowOverLimitOverride: v.optional(v.boolean()),
    lastHalfAlertAt: v.optional(v.number()),
    lastFullAlertAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const normalizedId = ctx.db.normalizeId("organizations", args.id);
    if (!normalizedId) throw new Error("Invalid Organization ID");

    const existing = await ctx.db.get(normalizedId);
    if (!existing) throw new Error("Organization not found");

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.isBlocked !== undefined) updates.isBlocked = args.isBlocked;
    if (args.allowOverLimitOverride !== undefined) {
      updates.allowOverLimitOverride = args.allowOverLimitOverride;
    }
    if (args.lastHalfAlertAt !== undefined) updates.lastHalfAlertAt = args.lastHalfAlertAt;
    if (args.lastFullAlertAt !== undefined) updates.lastFullAlertAt = args.lastFullAlertAt;

    await ctx.db.patch(normalizedId, updates);
    return await ctx.db.get(normalizedId);
  },
});

export const countOrgs = query({
  handler: async (ctx) => {
    const orgs = await ctx.db.query("organizations").collect();
    const totalOrgs = orgs.length;
    const blockedOrgs = orgs.filter((o) => o.isBlocked).length;
    return { totalOrgs, blockedOrgs };
  },
});
