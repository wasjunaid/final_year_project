const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class LabTestService {
    static async getLabTests() {
        try {
            const query = {
                text: `SELECT * FROM lab_test`,
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No lab tests found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error fetching lab tests: ${error.message}`);
            throw new AppError(`Error fetching lab tests: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertLabTest(name, description, cost) {
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }
        if (!description) {
            throw new AppError("description is required", statusCodes.BAD_REQUEST);
        }
        if (cost == null || isNaN(cost) || cost < 0) {
            throw new AppError("cost must be a non-negative number", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `INSERT INTO lab_test
                (name, description, cost)
                VALUES
                ($1, $2, $3)
                RETURNING *`,
                values: [name, description, cost],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to insert lab test", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting lab test: ${error.message}`);
            throw new AppError(`Error inserting lab test: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateLabTest(lab_test_id, {
        name,
        description,
        cost
    }) {
        if (!lab_test_id) {
            throw new AppError("lab_test_id is required", statusCodes.BAD_REQUEST);
        }
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }
        if (!description) {
            throw new AppError("description is required", statusCodes.BAD_REQUEST);
        }
        if (cost != null && (isNaN(cost) || cost < 0)) {
            throw new AppError("cost must be a non-negative number", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `UPDATE lab_test
                SET
                name = $1,
                description = $2,
                cost = $3,
                updated_at = CURRENT_TIMESTAMP
                WHERE lab_test_id = $4
                RETURNING *`,
                values: [name, description, cost, lab_test_id],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Lab test not found or no changes made", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating lab test: ${error.message}`);
            throw new AppError(`Error updating lab test: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { LabTestService };