const express = require("express");
const MedicineController = require("../../controllers/Medicine/MedicineController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([roles.HOSPITAL_PHARMACIST, roles.DOCTOR, roles.ADMIN]),
    MedicineController.getAllMedicinesIfExists
);

router.post(
    '/',
    allowedRoles([roles.HOSPITAL_PHARMACIST, roles.ADMIN]),
    MedicineController.insertMedicine
);

module.exports = router;