const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class CPTService {
    static async getCPTCodesIfExists() {
        try {
            const query = {
                text: `SELECT * FROM cpt`,
                values: []
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }
            
            return result.rows;
        } catch (error) {
            console.error(`Error in CPTService.getCPTCodesIfExists: ${error.message} ${error.stack}`);
            throw error;
        }
    }

    static async getCPTCodeIfExists(cpt_code) {
        try {
            if (!cpt_code) {
                throw new AppError("cpt_code is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM cpt WHERE cpt_code = $1`,
                values: [cpt_code]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in CPTService.getCPTCodeIfExists: ${error.message} ${error.stack}`);
            throw error;
        }
    }

    static async insertCPTCodeIfNotExists(cpt_code, description) {
        try {
            if (!cpt_code) {
                throw new AppError("cpt_code is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!description) {
                throw new AppError("CPT description is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof description !== 'string') {
                throw new AppError("CPT description must be a string", STATUS_CODES.BAD_REQUEST);
            }

            description = description.trim();

            if (description.length === 0) {
                throw new AppError("CPT description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO cpt (cpt_code, description)
                       VALUES ($1, $2)
                       ON CONFLICT (cpt_code)
                       DO
                       UPDATE
                       SET
                       description = EXCLUDED.description
                       RETURNING *`,
                values: [cpt_code, description]
            };
            await DatabaseService.query(query.text, query.values);
        } catch (error) {
            console.error(`Error in CPTService.insertCPTCodeIfNotExists: ${error.message} ${error.stack}`);
            throw error;
        }
    }
}

module.exports = {
    CPTService
};