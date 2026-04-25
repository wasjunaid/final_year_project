const express = require("express");
const PaymentController = require("../../controllers/Payment/PaymentController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

// Make payment from insurance to hospital
router.post(
    '/to-hospital',
  //  allowedRoles([roles.INSURANCE_ADMIN, roles.INSURANCE_STAFF]),
    PaymentController.makePaymentToHospital
);

// Get insurance wallet balance
router.get(
    '/balance/:wallet_address',
  //  allowedRoles([roles.INSURANCE_ADMIN, roles.INSURANCE_STAFF]),
    PaymentController.getWalletBalance
);

// Get insurance payment history
router.get(
    '/history/:wallet_address',
  //  allowedRoles([roles.INSURANCE_ADMIN, roles.INSURANCE_STAFF]),
    PaymentController.getPaymentHistory
);

module.exports = router;