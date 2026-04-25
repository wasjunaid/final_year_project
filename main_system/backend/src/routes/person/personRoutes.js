const express = require("express");
const PersonController = require("../../controllers/Person/PersonController");

const router = express.Router();

router.get(
    '/',
    PersonController.getPersonIfExists
);

router.put(
    '/',
    PersonController.updatePerson
);

router.delete(
    '/',
    PersonController.deletePerson
);

module.exports = router;