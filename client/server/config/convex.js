const { ConvexHttpClient } = require("convex/browser");
const path = require("path");
const dotenv = require("dotenv");

// Load env files
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) {
  console.warn("WARNING: CONVEX_URL is not set in environment variables.");
}

const client = new ConvexHttpClient(convexUrl || "https://dummy.convex.cloud");

module.exports = client;
