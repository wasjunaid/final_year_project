const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { BlacklistService } = require("../../services/System/BlacklistService");
const { EHRAccessService } = require("../../services/EHR/EHRAccessService");

class BlacklistController {
    /**
     * Initialize the blacklist with all existing person_ids from blockchain
     * This should only be called once during backend initialization
     * ADMIN/SUPER_ADMIN only
     */
    async initializeBlacklist(req, res) {
        try {
            console.log("[Blacklist Init] Starting blacklist initialization...");

            // Get all access history from blockchain
            const history = await EHRAccessService.getAccessHistoryFromBlockchain();
            
            if (!history || history.length === 0) {
                console.log("[Blacklist Init] No blockchain history found");
                return res.status(STATUS_CODES.OK).json({
                    data: {
                        blacklisted_count: 0,
                        message: 'No blockchain records found to blacklist'
                    },
                    message: 'Blacklist initialized (empty - no blockchain records)',
                    status: STATUS_CODES.OK,
                    success: true
                });
            }

            // Extract all unique person_ids from blockchain history
            const personIds = new Set();
            history.forEach(log => {
                if (log.patientId) personIds.add(log.patientId);
                if (log.doctorId) personIds.add(log.doctorId);
            });

            const personIdsArray = Array.from(personIds);
            console.log(`[Blacklist Init] Found ${personIdsArray.length} unique person_ids from blockchain`);
            console.log(`[Blacklist Init] Person IDs to blacklist:`, personIdsArray);

            // Clear existing blacklist first
            const clearedCount = await BlacklistService.clearBlacklist();
            console.log(`[Blacklist Init] Cleared ${clearedCount} existing blacklist entries`);

            // Add all person_ids to blacklist
            const addedCount = await BlacklistService.addMultipleToBlacklist(
                personIdsArray,
                'blockchain_sync'
            );

            console.log(`[Blacklist Init] ✓ Blacklist initialized with ${addedCount} person_ids`);

            // Get blacklist stats
            const stats = await BlacklistService.getBlacklistStats();

            return res.status(STATUS_CODES.OK).json({
                data: {
                    blacklisted_count: addedCount,
                    total_blockchain_records: history.length,
                    blacklist_stats: stats,
                    person_ids: personIdsArray.sort((a, b) => a - b)
                },
                message: `Blacklist initialized successfully with ${addedCount} person_ids`,
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in BlacklistController.initializeBlacklist: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to initialize blacklist',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    /**
     * Get all blacklisted person_ids
     * ADMIN/SUPER_ADMIN only
     */
    async getBlacklist(req, res) {
        try {
            const blacklistedIds = await BlacklistService.getAllBlacklistedIds();
            const stats = await BlacklistService.getBlacklistStats();

            return res.status(STATUS_CODES.OK).json({
                data: {
                    blacklisted_ids: blacklistedIds,
                    stats: stats
                },
                message: 'Blacklist retrieved successfully',
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in BlacklistController.getBlacklist: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to retrieve blacklist',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    /**
     * Check if a specific person_id is blacklisted
     */
    async checkIfBlacklisted(req, res) {
        try {
            const { person_id } = req.params;

            if (!person_id || isNaN(person_id)) {
                throw new AppError('Valid person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const isBlacklisted = await BlacklistService.isPersonBlacklisted(parseInt(person_id));

            return res.status(STATUS_CODES.OK).json({
                data: {
                    person_id: parseInt(person_id),
                    is_blacklisted: isBlacklisted
                },
                message: `Person ID ${isBlacklisted ? 'is' : 'is not'} blacklisted`,
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in BlacklistController.checkIfBlacklisted: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to check blacklist status',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    /**
     * Add a person_id to the blacklist (manual)
     * ADMIN/SUPER_ADMIN only
     */
    async addToBlacklist(req, res) {
        try {
            const { person_id, reason } = req.body;

            if (!person_id || isNaN(person_id)) {
                throw new AppError('Valid person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const result = await BlacklistService.addToBlacklist(
                parseInt(person_id),
                reason || 'manual_entry'
            );

            return res.status(STATUS_CODES.OK).json({
                data: result,
                message: `Person ID ${person_id} added to blacklist`,
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in BlacklistController.addToBlacklist: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to add to blacklist',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    /**
     * Remove a person_id from the blacklist
     * ADMIN/SUPER_ADMIN only
     */
    async removeFromBlacklist(req, res) {
        try {
            const { person_id } = req.params;

            if (!person_id || isNaN(person_id)) {
                throw new AppError('Valid person_id is required', STATUS_CODES.BAD_REQUEST);
            }

            const removed = await BlacklistService.removeFromBlacklist(parseInt(person_id));

            if (!removed) {
                throw new AppError(`Person ID ${person_id} not found in blacklist`, STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: { person_id: parseInt(person_id) },
                message: `Person ID ${person_id} removed from blacklist`,
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in BlacklistController.removeFromBlacklist: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to remove from blacklist',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    /**
     * Clear entire blacklist
     * ADMIN/SUPER_ADMIN only - Use with caution!
     */
    async clearBlacklist(req, res) {
        try {
            const clearedCount = await BlacklistService.clearBlacklist();

            return res.status(STATUS_CODES.OK).json({
                data: { cleared_count: clearedCount },
                message: `Blacklist cleared - ${clearedCount} entries removed`,
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in BlacklistController.clearBlacklist: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to clear blacklist',
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = { BlacklistController };
