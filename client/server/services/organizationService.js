const convex = require("../config/convex");
const crypto = require("crypto");
const env = require("../config/env");
const { getTodayDateRange } = require("./limitService");

function generateApiKey() {
  return `org_${crypto.randomBytes(24).toString("hex")}`;
}

async function createOrganization({ name, dailyLimit, status, contactName, contactEmail }) {
  const org = await convex.mutation("organizations:createOrg", {
    name,
    apiKey: generateApiKey(),
    contactName: contactName || "",
    contactEmail: contactEmail || "",
    dailyLimit: dailyLimit || env.defaultDailyEmailLimit,
    status: status || "active",
  });
  return { ...org, id: org._id };
}

async function listOrganizations(filters = {}) {
  const { status, blocked, search } = filters;

  const organizations = await convex.query("organizations:listOrgs", {
    status,
    blocked: blocked === true || blocked === false ? blocked : undefined,
    search
  });

  if (organizations.length === 0) return [];

  const { start, end } = getTodayDateRange();
  const orgIds = organizations.map((org) => org._id);
  
  const sentTodayMap = await convex.query("emailLogs:getTodayCountsByOrgs", {
    start: start.getTime(),
    end: end.getTime(),
    orgIds
  });

  return organizations.map((org) => ({
    ...org,
    id: org._id,
    sentToday: sentTodayMap[org._id] || 0
  }));
}

async function updateOrganizationControls(id, { isBlocked, allowOverLimitOverride }) {
  const org = await convex.mutation("organizations:updateOrgControls", {
    id,
    isBlocked: typeof isBlocked === "boolean" ? isBlocked : undefined,
    allowOverLimitOverride: typeof allowOverLimitOverride === "boolean" ? allowOverLimitOverride : undefined
  });
  return { ...org, id: org._id };
}

module.exports = { createOrganization, listOrganizations, updateOrganizationControls };
