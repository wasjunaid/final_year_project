const express = require("express");
const AppointmentCPTController = require("../../controllers/MedicalCoding/AppointmentCPTController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/:appointment_id",
    // allowedRoles([roles.MEDICAL_CODER]),
    AppointmentCPTController.getAppointmentCPTCodesIfExists
);

router.post(
    "/:appointment_id",
    // allowedRoles([roles.MEDICAL_CODER]),
    AppointmentCPTController.insertAppointmentCPTCode
);

module.exports = router;