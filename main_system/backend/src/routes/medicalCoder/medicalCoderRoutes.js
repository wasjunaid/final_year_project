const express = require("express");
const MedicalCoderController = require("../../controllers/MedicalCoder/MedicalCoderController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/",
    allowedRoles([roles.MEDICAL_CODER]),
    MedicalCoderController.getMedicalCoderIfExists
);

module.exports = router;