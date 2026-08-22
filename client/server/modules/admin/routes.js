const express = require("express");
const Joi = require("joi");
const convex = require("../../config/convex");
const authJwt = require("../../middleware/authJwt");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../utils/asyncHandler");
const { loginAdmin } = require("../../services/adminService");
const {
  createOrganization,
  listOrganizations,
  updateOrganizationControls
} = require("../../services/organizationService");
const { getTodayDateRange } = require("../../services/limitService");

const router = express.Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const createOrgSchema = Joi.object({
  name: Joi.string().min(2).required(),
  contactName: Joi.string().min(2).required(),
  contactEmail: Joi.string().email().required(),
  dailyLimit: Joi.number().integer().min(1).max(100000).default(100),
  status: Joi.string().valid("active", "inactive").default("active")
});

const orgControlSchema = Joi.object({
  isBlocked: Joi.boolean().optional(),
  allowOverLimitOverride: Joi.boolean().optional()
}).or("isBlocked", "allowOverLimitOverride");

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     email: { type: string, format: email }
 *                     role: { type: string }
 */
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await loginAdmin(req.body);
    res.json(result);
  })
);

/**
 * @swagger
 * /admin/create-org:
 *   post:
 *     summary: Create organization
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               contactName: { type: string }
 *               contactEmail: { type: string, format: email }
 *               dailyLimit: { type: integer, example: 100 }
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       201:
 *         description: Organization created
 */
router.post(
  "/create-org",
  authJwt,
  validate(createOrgSchema),
  asyncHandler(async (req, res) => {
    const org = await createOrganization(req.body);
    res.status(201).json(org);
  })
);

/**
 * @swagger
 * /admin/orgs:
 *   get:
 *     summary: List organizations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
 */
router.get(
  "/orgs",
  authJwt,
  asyncHandler(async (req, res) => {
    const organizations = await listOrganizations({
      status: req.query.status,
      blocked:
        typeof req.query.blocked === "string"
          ? req.query.blocked.toLowerCase() === "true"
          : undefined,
      search: req.query.search
    });
    res.json(organizations);
  })
);

router.patch(
  "/orgs/:id/controls",
  authJwt,
  validate(orgControlSchema),
  asyncHandler(async (req, res) => {
    const updated = await updateOrganizationControls(req.params.id, req.body);
    res.json(updated);
  })
);

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: List all email logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All logs across organizations
 */
router.get(
  "/logs",
  authJwt,
  asyncHandler(async (req, res) => {
    const from = req.query.from ? new Date(req.query.from).getTime() : undefined;
    const to = req.query.to ? new Date(req.query.to).getTime() : undefined;

    const logs = await convex.query("emailLogs:listLogs", {
      orgId: req.query.orgId,
      status: req.query.status,
      email: req.query.email,
      from,
      to,
      limit: 500
    });

    // To mimic include: { organization: { name } }, fetch organizations
    const orgs = await convex.query("organizations:listOrgs");
    const orgMap = new Map(orgs.map((o) => [o._id, o.name]));

    const mappedLogs = logs.map((log) => ({
      ...log,
      id: log._id,
      organization: { name: orgMap.get(log.orgId) || "Unknown Org" }
    }));

    const { start, end } = getTodayDateRange();
    const emailsSentToday = await convex.query("emailLogs:getTodayCountAllOrgs", {
      start: start.getTime(),
      end: end.getTime()
    });

    res.json({
      emailsSentToday: emailsSentToday || 0,
      logs: mappedLogs
    });
  })
);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/stats",
  authJwt,
  asyncHandler(async (req, res) => {
    const { start, end } = getTodayDateRange();
    const [orgCounts, sentToday] = await Promise.all([
      convex.query("organizations:countOrgs"),
      convex.query("emailLogs:getTodayCountAllOrgs", {
        start: start.getTime(),
        end: end.getTime()
      })
    ]);

    res.json({
      totalOrgs: orgCounts.totalOrgs,
      blockedOrgs: orgCounts.blockedOrgs,
      emailsSentToday: sentToday || 0
    });
  })
);

module.exports = router;
