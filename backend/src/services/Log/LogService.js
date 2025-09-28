const { pool } = require("../../config/databaseConfig");
const { SystemAdminService } = require("../System/systemAdminService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class LogService {
    static async getLogs(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const checkSystemAdminExists = await SystemAdminService.checkSystemAdminExists(person_id);
            if (!checkSystemAdminExists) {
                throw new AppError("Only system admins can get logs", statusCodes.BAD_REQUEST);
            }

            const query = {
                text: `SELECT lg.*,
                p.first_name,
                p.last_name
                FROM log lg
                JOIN person p ON lg.person_id = p.person_id
                ORDER BY lg.created_at DESC`,
                values: [],
            }
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No logs found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting logs: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertLog(person_id, action) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!action) {
            throw new AppError("action is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `INSERT INTO log
                (person_id, action)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [person_id, action],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Log insertion failed", statusCodes.INTERNAL_SERVER);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting log: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { LogService };