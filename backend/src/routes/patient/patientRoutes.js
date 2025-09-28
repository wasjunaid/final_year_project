const express = require("express");
const PatientController = require("../../controllers/Patient/PatientController");

const router = express.Router();

router.get(
    '/',
    PatientController.getPatient
);

// router.post(
//     '/',
//     PatientController.insertPatient
// );

router.put(
    '/',
    PatientController.updatePatient
);

router.delete(
    '/',
    PatientController.deletePatient
);

module.exports = router;