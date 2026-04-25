const express = require("express");
const InsuranceStaffController = require("../../controllers/Insurance/InsuranceStaffController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

router.get(
    "/",
    allowedRoles([roles.INSURANCE_ADMIN, roles.INSURANCE_SUB_ADMIN]),
    InsuranceStaffController.getAllInsuranceStaffIfExists
);

router.get(
    "/super-admin",
    allowedRoles([roles.SUPER_ADMIN]),
    InsuranceStaffController.getInsuranceStaffForSuperAdmin
);

router.post(
    "/",
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.INSURANCE_ADMIN
    ]),
    InsuranceStaffController.insertInsuranceStaff
);

router.delete(
    "/:insurance_staff_id",
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.INSURANCE_ADMIN
    ]),
    InsuranceStaffController.deleteInsuranceStaff
);

module.exports = router;