const express = require("express");
const PatientInsuranceController = require("../../controllers/Patient/PatientInsuranceController");

const router = express.Router();

router.get(
    "/",
    PatientInsuranceController.getPatientInsurances
);

router.post(
    "/",
    PatientInsuranceController.insertPatientInsurance
);

router.put(
    "/:patient_insurance_id",
    PatientInsuranceController.updatePatientInsurance
);

router.delete(
    "/:patient_insurance_id",
    PatientInsuranceController.deletePatientInsurance
);

module.exports = router;