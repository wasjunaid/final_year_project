const express = require("express");
const MedicineController = require("../../controllers/Medicine/MedicineController");

const router = express.Router();

router.get(
    '/',
    MedicineController.getMedicines
);

router.post(
    '/',
    MedicineController.insertMedicine
);

router.put(
    '/:medicine_id',
    MedicineController.updateMedicine
);

module.exports = router;