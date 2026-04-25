const express = require("express");
const InsuranceCompanyController = require("../../controllers/Insurance/InsuranceCompanyController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

router.get(
    "/",
    allowedRoles([roles.SUPER_ADMIN]),
    InsuranceCompanyController.getInsuranceCompaniesIfExists
);

router.post(
    "/",
    allowedRoles([roles.SUPER_ADMIN]),
    InsuranceCompanyController.insertInsuranceCompany
);

router.put(
    "/:insurance_company_id",
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.INSURANCE_ADMIN
    ]),
    InsuranceCompanyController.updateInsuranceCompany
);

router.delete(
    "/:insurance_company_id",
    allowedRoles([roles.SUPER_ADMIN]),
    InsuranceCompanyController.deleteInsuranceCompany
);

module.exports = router;