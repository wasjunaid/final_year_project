const express = require("express");
const HospitalController = require("../../controllers/Hospital/HospitalController");

const router = express.Router();

router.get(
    '/',
    HospitalController.getHospitals
);

router.post(
    '/',
    HospitalController.insertHospital
);

router.put(
    '/:hospital_id',
    HospitalController.updateHospital
);

router.delete(
    '/:hospital_id',
    HospitalController.deleteHospital
);

module.exports = router;