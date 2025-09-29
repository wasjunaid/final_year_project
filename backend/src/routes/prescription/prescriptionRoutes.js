const express = require("express");
const PrescriptionController = require("../../controllers/Prescription/PrescriptionController");

const router = express.Router();

router.get(
    '/:appointment_id',
    PrescriptionController.getPrescriptionsAgainstAppointment
);

router.post(
    '/',
    PrescriptionController.insertPrescription
);

router.put(
    '/:prescription_id',
    PrescriptionController.updatePrescription
);

router.delete(
    '/:prescription_id',
    PrescriptionController.deletePrescription
);

module.exports = router;