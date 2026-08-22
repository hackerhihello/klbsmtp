const express = require("express");
const adminRoutes = require("../modules/admin/routes");
const emailRoutes = require("../modules/email/routes");
const orgRoutes = require("../modules/org/routes");
const cronRoutes = require("./cronRoutes");

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/email", emailRoutes);
router.use("/org", orgRoutes);
router.use("/cron", cronRoutes);

module.exports = router;
