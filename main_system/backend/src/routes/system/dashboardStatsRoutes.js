const express = require("express");
const DashboardStatsController = require("../../controllers/System/DashboardStatsController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/summary",
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.ADMIN,
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.DOCTOR,
    ]),
    DashboardStatsController.getSummary
);

module.exports = router;
