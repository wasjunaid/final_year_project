const express = require("express");
const AppointmentIDCController = require("../../controllers/MedicalCoding/AppointmentICDController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/:appointment_id",
    // allowedRoles([roles.MEDICAL_CODER]),
    AppointmentIDCController.getAppointmentICDCodesIfExists
);

router.post(
    "/:appointment_id",
    // allowedRoles([roles.MEDICAL_CODER]),
    AppointmentIDCController.insertAppointmentICDCode
);

module.exports = router;