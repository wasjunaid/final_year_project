const express = require("express");
const InsuranceController = require("../../controllers/Insurance/InsuranceController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

router.get(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsuranceController.getInsurancesIfExists
);

router.post(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsuranceController.insertInsurance
);

router.put(
    "/:insurance_number",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsuranceController.updateInsurance
);

router.delete(
    "/:insurance_number",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsuranceController.deleteInsurance
);

router.put(
    "/:insurance_number/manual-auto-renew",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsuranceController.manualAutoRenewInsurance
);

module.exports = router;