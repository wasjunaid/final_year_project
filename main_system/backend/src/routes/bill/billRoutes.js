const express = require("express");
const BillController = require("../../controllers/Bill/BillController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");
const { verifyAccessJWT } = require("../../middlewares/verifyAccessJWTMiddleware")

const router = express.Router();

router.get(
    '/:appointment_id',
    verifyAccessJWT,
    // allowedRoles([
    //     roles.DOCTOR
    // ]),
    BillController.getBillAgainstAppointmentIfExists
);

router.put(
    '/claim',
    BillController.updateClaimStatus
);

router.put(
    '/resend/:bill_id',
    verifyAccessJWT,
    allowedRoles([
        roles.PATIENT
    ]),
    BillController.resendClaimForPatient
);

module.exports = router;