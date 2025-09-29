const express = require("express");
const InsuranceCompanyController = require("../../controllers/Insurance/InsuranceCompanyController");

const router = express.Router();

router.get(
    '/',
    InsuranceCompanyController.getInsuranceCompanies
);

router.post(
    '/',
    InsuranceCompanyController.insertInsuranceCompany
);

router.put(
    '/:insurance_company_id',
    InsuranceCompanyController.updateInsuranceCompany
);

router.delete(
    '/:insurance_company_id',
    InsuranceCompanyController.deleteInsuranceCompany
);

module.exports = router;