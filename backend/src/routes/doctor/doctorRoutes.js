const express = require("express");
const DoctorController = require("../../controllers/Doctor/DoctorController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");

const router = express.Router();

router.get(
    '/',
    allowedRoles(['doctor']),
    DoctorController.getDoctor
);

router.get(
    '/hospital/:hospital_id',
    allowedRoles(['hospital admin', 'hospital sub admin', 'hospital front desk']),
    DoctorController.getDoctorsForHospital
);

router.get(
    '/appointments',
    allowedRoles(['patient']),
    DoctorController.getDoctorsForAppointments
);

// router.post(
//     '/',
//     allowedRoles(['']),
//     DoctorController.insertDoctor
// );

router.put(
    '/',
    allowedRoles(['doctor']),
    DoctorController.updateDoctor
);

router.put(
    '/status/:doctor_id',
    allowedRoles(['hospital admin', 'hospital sub admin', 'hospital front desk']),
    DoctorController.updateDoctorStatus
)

router.delete(
    '/',
    allowedRoles(['doctor']),
    DoctorController.deleteDoctor
);

module.exports = router;