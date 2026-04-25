const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { validateID } = require("../../utils/idUtil");
const { validateFieldsForInsertMedicine } = require("../../validations/medicine/medicineValidations");

class MedicineService {
    /**
     * Retrieves a medicine by its ID if it exists.
     * @param {number} medicine_id - The ID of the medicine.
     * @returns {Promise<object|boolean>} The medicine object or false if not found.
     * @throws {AppError} if any issue occurs
     */
    static async getMedicineIfExists(medicine_id) {
        try {
            if (!medicine_id) {
                throw new AppError("medicine_id is required", STATUS_CODES.BAD_REQUEST);
            }

            medicine_id = validateID(medicine_id);

            const query = {
                text: `SELECT * FROM medicine
                WHERE
                medicine_id = $1`,
                values: [medicine_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in MedicineService.getMedicineIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Retrieves all medicines from the database.
     * @returns {Promise<Array|boolean>} Array of medicine objects or false if none exist.
     * @throws {AppError} if any issue occurs
     */
    static async getAllMedicinesIfExists() {
        try {
            const query = {
                text: `SELECT * FROM medicine`,
            };
            const result = await DatabaseService.query(query.text);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in MedicineService.getAllMedicinesIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new medicine into the database.
     * @param {string} name - The name of the medicine to insert.
     * @return {Promise<object>} The inserted medicine object.
     * @throws {AppError} if any issue occurs
     */
    static async insertMedicine(name) {
        try {
            if (!name) {
                throw new AppError("name is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ name } = validateFieldsForInsertMedicine({ name }));

            const query = {
                text: `INSERT INTO medicine
                (name)
                VALUES
                ($1)
                RETURNING *`,
                values: [name],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert medicine", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in MedicineService.insertMedicine: ${error.message} ${error.status}`);

            if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
                throw new AppError("Medicine already exists", STATUS_CODES.CONFLICT);
            }

            throw error;
        }
    }
}

module.exports = { MedicineService };