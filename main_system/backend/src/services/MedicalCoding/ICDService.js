const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class ICDService {
    static async getICDCodesIfExists() {
        try {
            const query = {
                text: `SELECT * FROM icd`,
                values: []
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }
            
            return result.rows;
        } catch (error) {
            console.error(`Error in ICDService.getICDCodesIfExists: ${error.message} ${error.stack}`);
            throw error;
        }
    }

    static async getICDCodeIfExists(icd_code) {
        try {
            if (!icd_code) {
                throw new AppError("icd_code is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM icd WHERE icd_code = $1`,
                values: [icd_code]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in ICDService.getICDCodeIfExists: ${error.message} ${error.stack}`);
            throw error;
        }
    }

    static async insertICDCodeIfNotExists(icd_code, description) {
        try {
            if (!icd_code) {
                throw new AppError("icd_code is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!description) {
                throw new AppError("ICD description is required", STATUS_CODES.BAD_REQUEST);
            }

            if (typeof description !== 'string') {
                throw new AppError("ICD description must be a string", STATUS_CODES.BAD_REQUEST);
            }

            description = description.trim();

            if (description.length === 0) {
                throw new AppError("ICD description cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO icd (icd_code, description)
                       VALUES ($1, $2)
                       ON CONFLICT (icd_code)
                       DO
                       UPDATE
                       SET
                       description = EXCLUDED.description
                       RETURNING *`,
                values: [icd_code, description]
            };
            await DatabaseService.query(query.text, query.values);
        } catch (error) {
            console.error(`Error in ICDService.insertICDCodeIfNotExists: ${error.message} ${error.stack}`);
            throw error;
        }
    }
}

module.exports = {
    ICDService
};