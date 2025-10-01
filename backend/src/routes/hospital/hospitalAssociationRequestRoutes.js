const express = require("express");
const HospitalAssociationRequestController = require("../../controllers/Hospital/HospitalAssociationRequestController");

const router = express.Router();

router.get(
    '/person',
    HospitalAssociationRequestController.getHospitalAssociationRequestsForPerson
);

router.get(
    '/hospital/:hospital_id',
    HospitalAssociationRequestController.getHospitalAssociationRequestsForHospital
); // change to fetch automatically based on logged in user's hospital_id

router.post(
    '/',
    HospitalAssociationRequestController.insertHospitalAssociationRequest
);

router.put(
    '/approve/:hospital_association_request_id',
    HospitalAssociationRequestController.approveHospitalAssociationRequest
);

router.delete(
    '/:hospital_association_request_id',
    HospitalAssociationRequestController.deleteHospitalAssociationRequest
);

router.delete(
    '/person',
    HospitalAssociationRequestController.deleteHospitalAssociationRequestsByPersonIDAndRole
);

module.exports = router;