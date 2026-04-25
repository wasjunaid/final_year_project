const express = require("express");
const CPTController = require("../../controllers/MedicalCoding/CPTController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/",
    // allowedRoles([roles.MEDICAL_CODER]),
    CPTController.getCPTCodesIfExists
);

router.get(
    "/:cpt_code",
    // allowedRoles([roles.MEDICAL_CODER]),
    CPTController.getCPTCodeIfExists
);

router.post(
    "/",
    // allowedRoles([roles.MEDICAL_CODER]),
    CPTController.insertCPTCodeIfNotExists
);

module.exports = router;