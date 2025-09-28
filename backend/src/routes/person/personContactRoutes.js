const express = require("express");
const PersonContactController = require("../../controllers/Person/PersonContactController");

const router = express.Router();

router.get(
    '/',
    PersonContactController.getPersonContacts
);

// router.post(
//     '/',
//     PersonContactController.insertPersonContact
// );

router.put(
    '/',
    PersonContactController.updatePersonContact
);

router.delete(
    '/',
    PersonContactController.deletePersonContact
);

module.exports = router;