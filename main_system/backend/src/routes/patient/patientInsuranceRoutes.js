const express = require("express");
const PatientInsuranceController = require("../../controllers/Patient/PatientInsuranceController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/",
    allowedRoles([roles.PATIENT]),
    PatientInsuranceController.getAllPatientInsurancesIfExists
);

router.post(
    "/",
    allowedRoles([roles.PATIENT]),
    PatientInsuranceController.insertPatientInsurance
);

router.post(
    "/verify/:patient_insurance_id",
    allowedRoles([roles.PATIENT]),
    PatientInsuranceController.sendPatientInsuranceVerificationRequest
);

router.put(
    "/auto-renew/:patient_insurance_id",
    allowedRoles([roles.PATIENT]),
    PatientInsuranceController.togglePatientInsuranceAutoRenew
);

router.put(
    "/deactivate/:patient_insurance_id",
    allowedRoles([roles.PATIENT]),
    PatientInsuranceController.deactivatePatientInsurance
);

router.put(
    "/:patient_insurance_id",
    allowedRoles([roles.PATIENT]),
    PatientInsuranceController.updatePatientInsurance
);

router.delete(
    "/:patient_insurance_id",
    allowedRoles([roles.PATIENT]),
    PatientInsuranceController.deletePatientInsurance
);

module.exports = router;