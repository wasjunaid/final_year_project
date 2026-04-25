const express = require("express");
const ICDController = require("../../controllers/MedicalCoding/ICDController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/",
    // allowedRoles([roles.MEDICAL_CODER]),
    ICDController.getICDCodesIfExists
);

router.get(
    "/:icd_code",
    // allowedRoles([roles.MEDICAL_CODER]),
    ICDController.getICDCodeIfExists
);

router.post(
    "/",
    // allowedRoles([roles.MEDICAL_CODER]),
    ICDController.insertICDCodeIfNotExists
);

module.exports = router;