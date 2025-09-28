const express = require("express");
const PersonController = require("../../controllers/Person/PersonController");

const router = express.Router();

router.get(
    '/',
    PersonController.getPerson
);

// router.post(
//     '/',
//     PersonController.insertPerson
// );

router.put(
    '/',
    PersonController.updatePerson
);

router.delete(
    '/',
    PersonController.deletePerson
);

module.exports = router;