const express = require("express");
const LabTestController = require("../../controllers/LabTest/LabTestController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_LAB_TECHNICIAN,
        roles.DOCTOR
    ]),
    LabTestController.getAllLabTestsIfExists
);

router.post(
    '/',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_LAB_TECHNICIAN
    ]),
    LabTestController.insertLabTest
);

router.put(
    '/:lab_test_id',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_LAB_TECHNICIAN
    ]),
    LabTestController.updateLabTest
);

module.exports = router;