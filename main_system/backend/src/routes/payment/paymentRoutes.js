const express = require("express");
const PaymentController = require("../../controllers/Payment/PaymentController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");
const { verifyAccessJWT } = require("../../middlewares/verifyAccessJWTMiddleware");
const { verifyInsuranceApiKey } = require("../../middlewares/verifyInsuranceApiKeyMiddleware");

const router = express.Router();

// Register or update hospital on blockchain
router.post(
    '/register-hospital',
    verifyAccessJWT,
    allowedRoles([roles.SUPER_ADMIN, roles.HOSPITAL_ADMIN]),
    PaymentController.registerOrUpdateHospital
);

// Get hospital address by ID from blockchain
router.get(
    '/hospital-address/:hospital_id',
    verifyAccessJWT,
    PaymentController.getHospitalAddressById
);

// Patient to Hospital payment
router.post(
    '/patient-to-hospital', 
    verifyAccessJWT,
    allowedRoles([roles.PATIENT]),
    PaymentController.patientToHospital
);

// Insurance to Hospital payment (called from insurance backend)
router.post(
    '/insurance-to-hospital',
    verifyInsuranceApiKey,
    PaymentController.insuranceToHospital
);

// Get wallet balance
router.get(
    '/balance/:wallet_address',
    PaymentController.getWalletBalance
);

// Get patient payment history
router.get(
    '/history/patient/:wallet_address',
    verifyAccessJWT,
    allowedRoles([roles.PATIENT, roles.HOSPITAL_ADMIN, roles.SUPER_ADMIN]),
    PaymentController.getPatientPaymentHistory
);

// Get insurance payment history
router.get(
    '/history/insurance/:wallet_address',
    verifyInsuranceApiKey,
    PaymentController.getInsurancePaymentHistory
);

// Get hospital received payment history
router.get(
    '/history/hospital/:wallet_address',
    verifyAccessJWT,
    allowedRoles([roles.HOSPITAL_ADMIN, roles.HOSPITAL_SUB_ADMIN, roles.SUPER_ADMIN]),
    PaymentController.getHospitalReceivedHistory
);

module.exports = router;