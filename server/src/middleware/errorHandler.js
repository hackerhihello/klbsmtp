function errorHandler(error, req, res, next) {
  let status = error.status;
  let message = error.message || "Internal server error";
  let details = error.details ?? null;
  let responseCode;

  const isDbError =
    !process.env.DATABASE_URL ||
    (typeof message === "string" &&
      (message.includes("DATABASE_URL") ||
        message.includes("fetch failed") ||
        message.includes("FetchError") ||
        message.includes("database unavailable")));

  if (status == null && isDbError) {
    status = 503;
    responseCode = "DATABASE_UNAVAILABLE";
    message =
      "Cannot connect to the database. Ensure DATABASE_URL is configured correctly in your environment variables.";
    if (process.env.NODE_ENV === "development") {
      details = {
        hint: "Local: check server/.env. Deployed: check your Vercel project environment variables.",
        error: error.message
      };
    }
  }

  status = status || 500;
  const payload = { message, details };
  if (responseCode) payload.code = responseCode;
  res.status(status).json(payload);
}

module.exports = errorHandler;
