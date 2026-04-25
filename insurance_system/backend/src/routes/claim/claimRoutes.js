const express = require("express");
const ClaimController = require("../../controllers/Claim/ClaimController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");
const { verifyAccessJWT } = require("../../middlewares/verifyAccessJWTMiddleware");

const router = express.Router();

router.get(
    "/",
    verifyAccessJWT,
    allowedRoles([roles.INSURANCE_ADMIN, roles.INSURANCE_SUB_ADMIN]),
    ClaimController.getAllClaimsIfExists
);

router.get(
    "/accepted-unpaid",
    verifyAccessJWT,
    allowedRoles([roles.INSURANCE_ADMIN, roles.INSURANCE_SUB_ADMIN]),
    ClaimController.getAllAcceptedandNotPaidClaimsAgainstInsuranceCompany
)

router.post(
    "/",
    // allowedRoles([roles.INSURANCE_ADMIN, roles.INSURANCE_SUB_ADMIN]),
    ClaimController.insertClaim
);

router.put(
    "/:claim_id",
    verifyAccessJWT,
    allowedRoles([roles.INSURANCE_ADMIN, roles.INSURANCE_SUB_ADMIN]),
    ClaimController.updateClaimStatus
);

module.exports = router;