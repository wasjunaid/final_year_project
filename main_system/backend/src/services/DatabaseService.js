const { pool } = require('../config/databaseConfig');
const { STATUS_CODES } = require('../utils/statusCodesUtil');
const { AppError } = require('../classes/AppErrorClass');

class DatabaseService {
    static getReadableErrorMessage(error) {
        if (!error) {
            return "Unknown database error";
        }

        if (typeof error === 'string') {
            return error;
        }

        if (error.message && String(error.message).trim().length > 0) {
            return error.message;
        }

        if (Array.isArray(error.errors) && error.errors.length > 0) {
            return error.errors
                .map((err) => err?.message || String(err))
                .filter(Boolean)
                .join(' | ');
        }

        if (error.code) {
            return `Database error code: ${error.code}`;
        }

        return "Unknown database error";
    }

    /**
     * Runs a query against the database.
     * @param {string} text - SQL query text
     * @param {Array} params - parameters for the query
     * @returns {Promise<{rows: Array<Object>, rowCount: number, command: string}>} PostgreSQL query result
     * @throws {AppError} if any issue occurs
     */
    static async query(text, params = []) {
        let client;
        try {
            client = await pool.connect();
            const result = await client.query(text, params);

            return result;
        } catch (error) {
            const message = DatabaseService.getReadableErrorMessage(error);
            console.error(`Error in DatabaseService.query: ${message}`);
            throw new AppError(message, STATUS_CODES.INTERNAL_SERVER_ERROR);
        } finally {
            if (client) {
                client.release();
            }
        }
    }
    
    /**
     * Executes multiple queries in a transaction.
     * @param {Array<{text: string, params: Array}>} queries - array of query objects
     * @returns {Promise<Array<{rows: Array<Object>, rowCount: number, command: string}>>} array of PostgreSQL query results
     * @throws {AppError} if any issue occurs
     */
    static async transaction(queries) {
        let client;
        try {
            client = await pool.connect();
            await client.query('BEGIN');
            const results = [];
            for (const query of queries) {
                results.push(await client.query(query.text, query.params));
            }
            await client.query('COMMIT');
            return results;
        } catch (error) {
            if (client) {
                try {
                    await client.query('ROLLBACK');
                } catch (_) {}
            }
            const message = DatabaseService.getReadableErrorMessage(error);
            console.error(`Error in DatabaseService.transaction: ${message}`);
            throw new AppError(message, STATUS_CODES.INTERNAL_SERVER_ERROR);
        } finally {
            if (client) {
                client.release();
            }
        }
    }
}

module.exports = {
    DatabaseService
};