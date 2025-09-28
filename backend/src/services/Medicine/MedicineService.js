const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class MedicineService {
    static async getMedicines() {
        try {
            const query = {
                text: `SELECT * FROM medicine`,
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No medicines found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching medicines: ${error.message}`);
            throw new AppError(`Error fetching medicines: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertMedicine(name) {
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `INSERT INTO medicine
                (name)
                VALUES
                ($1)
                RETURNING *`,
                values: [name],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to insert medicine", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting medicine: ${error.message}`);
            throw new AppError(`Error inserting medicine: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateLabTest(medicine_id, name) {
        if (!medicine_id) {
            throw new AppError("medicine_id is required", statusCodes.BAD_REQUEST);
        }
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `UPDATE medicine
                SET
                name = $1,
                updated_at = CURRENT_TIMESTAMP
                WHERE medicine_id = $2
                RETURNING *`,
                values: [name, medicine_id],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Medicine not found or no changes made", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating medicine: ${error.message}`);
            throw new AppError(`Error updating medicine: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { MedicineService };