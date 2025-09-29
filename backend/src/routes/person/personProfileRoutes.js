const express = require("express");
const PersonProfileController = require("../../controllers/Person/PersonProfileController");

const router = express.Router();

router.get(
    '/',
    PersonProfileController.getPersonProfile
);

module.exports = router;