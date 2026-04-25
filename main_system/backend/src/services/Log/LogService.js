const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateID } = require("../../utils/idUtil");
const { validateFieldsForInsertLog } = require("../../validations/log/logValidations");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

class LogService {
    /**
     * Retrieves logs from the database.
     * @param {number} person_id - The ID of the person whose logs are to be retrieved.
     * @returns {Promise<Array>} - A promise that resolves to an array of log objects.
     * @throws {AppError} if any issue occurs
     */
    static async getLogsIfExists(person_id, viewerRole, options = {}) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            person_id = validateID(person_id);

            const {
                search = "",
                userId,
                dateFrom,
                dateTo,
                page = 1,
                limit = 50,
            } = options;

            const safePage = Math.max(1, Number(page) || 1);
            const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));
            const offset = (safePage - 1) * safeLimit;

            const where = [];
            const values = [];

            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                values.push(searchTerm);
                const placeholder = `$${values.length}`;
                where.push(`(lv.action ILIKE ${placeholder} OR lv.first_name ILIKE ${placeholder} OR lv.last_name ILIKE ${placeholder} OR lv.email ILIKE ${placeholder})`);
            }

            if (userId) {
                const validatedUserId = validateID(userId);
                values.push(validatedUserId);
                where.push(`lv.person_id = $${values.length}`);
            }

            if (dateFrom) {
                values.push(dateFrom);
                where.push(`lv.created_at::timestamp >= $${values.length}::timestamp`);
            }

            if (dateTo) {
                values.push(dateTo);
                where.push(`lv.created_at::timestamp <= ($${values.length}::timestamp + INTERVAL '1 day' - INTERVAL '1 second')`);
            }

            const isSystemAnalyticsViewer =
                viewerRole === roles.SUPER_ADMIN ||
                viewerRole === roles.ADMIN;

            if (!isSystemAnalyticsViewer) {
                values.push(person_id);
                where.push(`lv.person_id = $${values.length}`);
            }

            const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

            const countQuery = {
                text: `SELECT COUNT(*)::int AS total_items FROM log_view lv ${whereClause}`,
                values,
            };

            const dataQuery = {
                text: `SELECT * FROM log_view lv
                ${whereClause}
                ORDER BY lv.created_at::timestamp DESC
                LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
                values: [...values, safeLimit, offset],
            };

            const [countResult, result] = await Promise.all([
                DatabaseService.query(countQuery.text, countQuery.values),
                DatabaseService.query(dataQuery.text, dataQuery.values),
            ]);

            const totalItems = countResult.rows[0]?.total_items || 0;
            const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);
            
            if (result.rowCount === 0) {
                return false;
            }

            return {
                rows: result.rows,
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    totalItems,
                    totalPages,
                },
            };
        } catch (error) {
            console.error(`Error in LogService.getLogsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Inserts a new log entry into the database.
     * @param {number} person_id - The ID of the person associated with the log.
     * @param {string} action - The action performed.
     * @returns {Promise<object>} The inserted log object.
     * @throws {AppError} if any issue occurs
     */
    static async insertLog(person_id, action) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!action) {
                throw new AppError("action is required", STATUS_CODES.BAD_REQUEST);
            }

            ({ person_id, action } = validateFieldsForInsertLog({ person_id, action }));

            const query = {
                text: `INSERT INTO log
                (person_id, action)
                VALUES
                ($1, $2)
                RETURNING *`,
                values: [person_id, action],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Log insertion failed", STATUS_CODES.INTERNAL_SERVER);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in LogService.insertLog: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { LogService };