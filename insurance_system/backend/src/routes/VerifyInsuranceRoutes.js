const express = require("express");
const VerifyInsuranceController = require("../controllers/VerifyInsuranceController");

const router = express.Router();

router.post(
    "/",
    VerifyInsuranceController.verifyPersonInsurance
);

module.exports = router;