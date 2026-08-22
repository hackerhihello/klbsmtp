const express = require("express");
const convex = require("../config/convex");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/daily-report",
  asyncHandler(async (req, res) => {
    // Basic security token check if CRON_SECRET is configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "Unauthorized cron request" });
      }
    }

    const since = new Date();
    since.setDate(since.getDate() - 1);
    
    const summary = await convex.query("emailLogs:getDailyReportSummary", {
      since: since.getTime()
    });

    console.log("Daily email report summary (triggered via HTTP cron):", summary);

    res.json({
      success: true,
      message: "Daily report summary generated",
      summary
    });
  })
);

module.exports = router;
