const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class InsuranceService {
    static async getInsurance(insurance_number) {
        try {
            const query = {
                text: `SELECT * FROM insurance
                WHERE
                insurance_number = $1`,
                values: [insurance_number]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No insurance found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting insurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertInsurance(insurance_number, insurance_company_id) {
        if (!insurance_number) {
            throw new AppError("insurance_number is required", statusCodes.BAD_REQUEST);
        }
        if (!insurance_company_id) {
            throw new AppError("insurance_company_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const existingInsurance = await InsuranceService.checkInsuranceExists(insurance_number);
            if (existingInsurance) {
                return existingInsurance;
            }

            const query = {
                text: `INSERT INTO insurance
                (insurance_number, insurance_company_id)
                VALUES ($1, $2)
                RETURNING *`,
                values: [insurance_number, insurance_company_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error inserting insurance", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting insurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateInsurance(insurance_number, insurance_company_id) {
        if (!insurance_number) {
            throw new AppError("insurance_number is required", statusCodes.BAD_REQUEST);
        }
        if (!insurance_company_id) {
            throw new AppError("insurance_company_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const result = await this.insertInsurance(insurance_number, insurance_company_id);

            return result;
        } catch (error) {
            console.error(`Error updating insurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkInsuranceExists(insurance_number) {
        if (!insurance_number) {
            throw new AppError("insurance_number is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM insurance
                WHERE
                insurance_number = $1`,
                values: [insurance_number]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error checking insurance exists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { InsuranceService };