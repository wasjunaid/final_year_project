const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class MedicalCoderService {
    /**
     * Retrieves a medical coder by ID if exists.
     * @param {number} medical_coder_id - The ID of the medical coder.
     * @returns {Promise<object|boolean>} The medical coder object if found, otherwise false.
     * @throws {AppError} if any issue occurs
     */
    static async getMedicalCoderIfExists(medical_coder_id) {
        try {
            if (!medical_coder_id) {
                throw new AppError("medical_coder_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM medical_coder
                WHERE
                medical_coder_id = $1`,
                values: [medical_coder_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in MedicalCoderService.getMedicalCoderIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new medical coder into the database if not exists.
     * @param {number} medical_coder_id - The ID of the medical coder.
     * @returns {Promise<object>} The inserted medical coder object or existing one if already present.
     * @throws {AppError} if any issue occurs
     */
    static async insertMedicalCoderIfNotExists(medical_coder_id) {
        try {
            if (!medical_coder_id) {
                throw new AppError("medical_coder_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO medical_coder
                (medical_coder_id)
                VALUES
                ($1)
                ON CONFLICT (medical_coder_id)
                DO
                UPDATE
                SET
                medical_coder_id = EXCLUDED.medical_coder_id
                RETURNING *`,
                values: [medical_coder_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting medical coder", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in MedicalCoderService.insertMedicalCoderIfNotExists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { MedicalCoderService };