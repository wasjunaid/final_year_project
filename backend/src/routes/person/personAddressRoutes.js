const express = require("express");
const PersonAddressController = require("../../controllers/Person/PersonAddressController");

const router = express.Router();

router.get(
    '/',
    PersonAddressController.getPersonAddress
);

 router.post(
     '/',
     PersonAddressController.insertOrUpdatePersonAddress
);

router.put(
    '/',
    PersonAddressController.insertOrUpdatePersonAddress
);

module.exports = router;