const convex = require("../config/convex");

async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ message: "Missing x-api-key header" });

  const organization = await convex.query("organizations:getOrgByApiKey", { apiKey });
  if (!organization) return res.status(401).json({ message: "Invalid API key" });
  if (organization.status !== "active") {
    return res.status(403).json({ message: "Organization is inactive" });
  }
  if (organization.isBlocked) {
    return res.status(403).json({ message: "Organization is blocked by admin" });
  }

  // Map Convex ID
  organization.id = organization._id;

  req.org = organization;
  req.organization = organization;
  next();
}

module.exports = apiKeyAuth;
