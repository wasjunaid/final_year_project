const express = require("express");
const InsuranceCompanyController = require("../../controllers/Insurance/InsuranceCompanyController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles, VALID_ROLES } = require("../../validations/auth/authValidations");
const { verifyAccessJWT } = require("../../middlewares/verifyAccessJWTMiddleware");
const { INTERSYSTEM_SYNC_SECRET } = require("../../config/insuranceBackendConfig");

const router = express.Router();

const internalSyncOnly = (req, res, next) => {
    const providedSecret = req.headers["x-sync-secret"];
    if (providedSecret !== INTERSYSTEM_SYNC_SECRET) {
        return res.status(403).json({
            data: null,
            message: "Forbidden",
            status: 403,
            success: false,
        });
    }

    return next();
};

router.get(
    '/',
    verifyAccessJWT,
    allowedRoles(VALID_ROLES.filter((role) => role !== roles.PERSON)),
    InsuranceCompanyController.getAllInsuranceCompaniesIfExists
);

router.post(
    '/',
    internalSyncOnly,
    InsuranceCompanyController.insertInsuranceCompany
);

router.put(
    '/:insurance_company_id',
    internalSyncOnly,
    InsuranceCompanyController.updateInsuranceCompany
);

module.exports = router;