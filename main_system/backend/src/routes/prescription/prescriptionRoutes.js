const express = require("express");
const PrescriptionController = require("../../controllers/Prescription/PrescriptionController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/patient/current",
    allowedRoles([roles.PATIENT]),
    PrescriptionController.getCurrentPrescriptionsForPatient
);

router.get(
    "/doctor/current/:patient_id",
    allowedRoles([roles.DOCTOR]),
    PrescriptionController.getCurrentPrescriptionsForDoctor
);

router.get(
    "/",
    allowedRoles([roles.PATIENT]),
    PrescriptionController.getPrescriptionsAgainstAppointmentIfExists
);

router.post(
    "/",
    allowedRoles([roles.HOSPITAL_PHARMACIST, roles.DOCTOR]),
    PrescriptionController.insertPrescription
);

router.put(
    "/:prescription_id",
    allowedRoles([roles.PATIENT]),
    PrescriptionController.removeFromCurrentPrescriptions
);

module.exports = router;