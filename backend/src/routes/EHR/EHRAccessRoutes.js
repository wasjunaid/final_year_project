const express = require("express");
const EHRAccessController = require("../../controllers/EHR/EHRAccessController");

const router = express.Router();

router.get(
    "/patient/requests",
    EHRAccessController.getEHRAccessForPatient
);

router.get(
    "/doctor/requests",
    EHRAccessController.getEHRAccessForDoctor
);

router.post(
    "/:patient_id",
    EHRAccessController.insertEHRAccess
);

router.put(
    "/grant/:ehr_access_id",
    EHRAccessController.grantEHRAccess
);

router.put(
    "/revoke/:ehr_access_id",
    EHRAccessController.revokeEHRAccess
);

module.exports = router;