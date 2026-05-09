const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

class BlacklistService {
    /**
     * Check if a person_id is blacklisted
     * @param {number} person_id - The person ID to check
     * @returns {Promise<boolean>} - True if blacklisted, false otherwise
     */
    static async isPersonBlacklisted(person_id) {
        try {
            if (!person_id) {
                return false;
            }

            const query = {
                text: `SELECT 1 FROM blacklist WHERE person_id = $1 LIMIT 1`,
                values: [person_id]
            };
            
            const result = await DatabaseService.query(query.text, query.values);
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error in BlacklistService.isPersonBlacklisted: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get all blacklisted person IDs
     * @returns {Promise<Array<number>>} - Array of blacklisted person_ids
     */
    static async getAllBlacklistedIds() {
        try {
            const query = {
                text: `SELECT person_id FROM blacklist ORDER BY person_id ASC`,
                values: []
            };
            
            const result = await DatabaseService.query(query.text, query.values);
            return result.rows.map(row => row.person_id);
        } catch (error) {
            console.error(`Error in BlacklistService.getAllBlacklistedIds: ${error.message}`);
            throw error;
        }
    }

    /**
     * Add a person_id to the blacklist
     * @param {number} person_id - The person ID to blacklist
     * @param {string} reason - Reason for blacklisting (default: 'blockchain_sync')
     * @param {object} metadata - Additional metadata
     * @returns {Promise<Object>} - The inserted blacklist record
     */
    static async addToBlacklist(person_id, reason = 'blockchain_sync', metadata = {}) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `INSERT INTO blacklist (person_id, reason, metadata)
                VALUES ($1, $2, $3)
                ON CONFLICT (person_id) DO UPDATE
                SET reason = EXCLUDED.reason, metadata = EXCLUDED.metadata
                RETURNING *`,
                values: [person_id, reason, JSON.stringify(metadata)]
            };
            
            const result = await DatabaseService.query(query.text, query.values);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in BlacklistService.addToBlacklist: ${error.message}`);
            throw error;
        }
    }

    /**
     * Add multiple person_ids to the blacklist in bulk
     * @param {Array<number>} person_ids - Array of person_ids to blacklist
     * @param {string} reason - Reason for blacklisting (default: 'blockchain_sync')
     * @returns {Promise<number>} - Number of records inserted/updated
     */
    static async addMultipleToBlacklist(person_ids, reason = 'blockchain_sync') {
        try {
            if (!Array.isArray(person_ids) || person_ids.length === 0) {
                throw new AppError('person_ids must be a non-empty array', STATUS_CODES.BAD_REQUEST);
            }

            // Filter out any duplicates and null values
            const uniqueIds = [...new Set(person_ids.filter(id => id && !isNaN(id)))];

            const query = {
                text: `INSERT INTO blacklist (person_id, reason, metadata)
                SELECT unnest($1::int[]), $2, '{}'::jsonb
                ON CONFLICT (person_id) DO UPDATE
                SET reason = EXCLUDED.reason
                RETURNING person_id`,
                values: [uniqueIds, reason]
            };
            
            const result = await DatabaseService.query(query.text, query.values);
            return result.rowCount;
        } catch (error) {
            console.error(`Error in BlacklistService.addMultipleToBlacklist: ${error.message}`);
            throw error;
        }
    }

    /**
     * Remove a person_id from the blacklist
     * @param {number} person_id - The person ID to remove from blacklist
     * @returns {Promise<boolean>} - True if removed, false if not found
     */
    static async removeFromBlacklist(person_id) {
        try {
            if (!person_id) {
                throw new AppError('person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `DELETE FROM blacklist WHERE person_id = $1 RETURNING person_id`,
                values: [person_id]
            };
            
            const result = await DatabaseService.query(query.text, query.values);
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error in BlacklistService.removeFromBlacklist: ${error.message}`);
            throw error;
        }
    }

    /**
     * Clear entire blacklist
     * @returns {Promise<number>} - Number of records deleted
     */
    static async clearBlacklist() {
        try {
            const query = {
                text: `DELETE FROM blacklist RETURNING person_id`,
                values: []
            };
            
            const result = await DatabaseService.query(query.text, query.values);
            return result.rowCount;
        } catch (error) {
            console.error(`Error in BlacklistService.clearBlacklist: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get the next available person_id that's not blacklisted
     * @param {number} startFrom - Starting person_id to check from (default: 1)
     * @param {number} maxAttempts - Maximum attempts to find non-blacklisted ID (default: 10000)
     * @returns {Promise<number>} - First available non-blacklisted person_id
     */
    static async getNextAvailablePersonId(startFrom = 1, maxAttempts = 10000) {
        try {
            const query = {
                text: `SELECT person_id FROM blacklist 
                WHERE person_id >= $1 AND person_id < $2
                ORDER BY person_id ASC`,
                values: [startFrom, startFrom + maxAttempts]
            };
            
            const result = await DatabaseService.query(query.text, query.values);
            const blacklistedIds = new Set(result.rows.map(row => row.person_id));
            
            // Find first non-blacklisted ID
            for (let i = startFrom; i < startFrom + maxAttempts; i++) {
                if (!blacklistedIds.has(i)) {
                    return i;
                }
            }
            
            throw new AppError('Could not find available person_id', STATUS_CODES.INTERNAL_SERVER_ERROR);
        } catch (error) {
            console.error(`Error in BlacklistService.getNextAvailablePersonId: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get blacklist stats
     * @returns {Promise<Object>} - Statistics about the blacklist
     */
    static async getBlacklistStats() {
        try {
            const query = {
                text: `SELECT 
                COUNT(*) as total_blacklisted,
                MIN(person_id) as min_person_id,
                MAX(person_id) as max_person_id,
                COUNT(DISTINCT reason) as reason_count
                FROM blacklist`,
                values: []
            };
            
            const result = await DatabaseService.query(query.text, query.values);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in BlacklistService.getBlacklistStats: ${error.message}`);
            throw error;
        }
    }
}

module.exports = { BlacklistService };
