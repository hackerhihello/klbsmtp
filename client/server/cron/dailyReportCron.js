function startDailyReportCron() {
  console.log("Daily report cron scheduler disabled in serverless environment. Use Vercel Cron hitting /api/v1/cron/daily-report instead.");
}

module.exports = startDailyReportCron;
