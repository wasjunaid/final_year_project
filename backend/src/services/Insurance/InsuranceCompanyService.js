const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class InsuranceCompanyService {
    static async getInsuranceCompanies() {
        try {
            const query = {
                text: `SELECT * FROM insurance_company`,
            };
            const result = await pool.query(query);

            return result.rows;
        } catch (error) {
            throw new AppError(`Error fetching insurance companies: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async insertInsuranceCompany(name) {
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkExists = await this.checkInsuranceCompanyExists(name);
            if (checkExists) {
                throw new AppError("Insurance company with this name already exists", statusCodes.CONFLICT);
            }

            const query = {
                text: `INSERT INTO insurance_company
                (name)
                VALUES ($1)
                RETURNING *`,
                values: [name]
            };
            const result = await pool.query(query);
            if (!result.rows[0]) {
                throw new AppError("Error inserting insurance company", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error inserting insurance company: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateInsuranceCompany(insurance_company_id, name) {
        if (!insurance_company_id) {
            throw new AppError("insurance_company_id is required", statusCodes.BAD_REQUEST);
        }
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkExists = await this.checkInsuranceCompanyExists(name);
            if (checkExists) {
                throw new AppError("Insurance company with this name already exists", statusCodes.CONFLICT);
            }

            const query = {
                text: `UPDATE insurance_company
                SET name = $1,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                insurance_company_id = $2
                RETURNING *`,
                values: [name, insurance_company_id]
            };
            const result = await pool.query(query);
            if (!result.rows[0]) {
                throw new AppError("Error updating insurance company", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`Error updating insurance company: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async deleteInsuranceCompany(insurance_company_id) {
        if (!insurance_company_id) {
            throw new AppError("insurance_company_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM insurance_company
                WHERE
                insurance_company_id = $1`,
                values: [insurance_company_id]
            };
            const result = await pool.query(query);
            if (result.rowCount === 0) {
                throw new AppError("Error deleting insurance company", statusCodes.INTERNAL_SERVER_ERROR);
            }
        } catch (error) {
            throw new AppError(`Error deleting insurance company: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async checkInsuranceCompanyExists(name) {
        if (!name) {
            throw new AppError("name is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM insurance_company
                WHERE name = $1`,
                values: [name]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`error in checkInsuranceCompanyExists: ${error.message}`);
            throw new AppError(`Error checking insurance company existence: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { InsuranceCompanyService };