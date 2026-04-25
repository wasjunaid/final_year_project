const express = require("express");
const InsurancePlanController = require("../../controllers/Insurance/InsurancePlanController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

router.get(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsurancePlanController.getInsurancePlansIfExists
);

router.post(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsurancePlanController.insertInsurancePlan
);

router.put(
    "/:insurance_plan_id",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsurancePlanController.updateInsurancePlan
);

router.delete(
    "/:insurance_plan_id",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsurancePlanController.deleteInsurancePlan
);

module.exports = router;