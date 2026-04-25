const express = require("express");
const PersonInsuranceController = require("../../controllers/Person/PersonInsuranceController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

router.get(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    PersonInsuranceController.getPersonInsurancesIfExists
);

router.post(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    PersonInsuranceController.insertPersonInsurance
);

router.delete(
    "/:person_insurance_id",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    PersonInsuranceController.deletePersonInsurance
);

module.exports = router;