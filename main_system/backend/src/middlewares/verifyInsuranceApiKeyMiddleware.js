const { STATUS_CODES } = require("../utils/statusCodesUtil");
require("dotenv").config();

/**
 * Middleware to verify insurance backend API key
 * Checks if the API key in request header matches the one in environment
 */
const verifyInsuranceApiKey = (req, res, next) => {
    try {
        const apiKey = req.headers['x-insurance-api-key'];
        
        if (!apiKey) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                data: null,
                message: "Insurance API key is required",
                success: false
            });
        }

        const validApiKey = process.env.INSURANCE_API_KEY;
        
        if (!validApiKey) {
            console.error("INSURANCE_API_KEY not configured in environment variables");
            return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: "Server configuration error",
                success: false
            });
        }

        if (apiKey !== validApiKey) {
            console.warn(`Invalid insurance API key attempt: ${apiKey.substring(0, 10)}...`);
            return res.status(STATUS_CODES.UNAUTHORIZED).json({
                data: null,
                message: "Invalid insurance API key",
                success: false
            });
        }

        console.log('[Insurance API] Valid API key verified');
        next();
    } catch (error) {
        console.error(`Error in verifyInsuranceApiKey middleware: ${error.message}`);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            data: null,
            message: "Authentication failed",
            success: false
        });
    }
};

module.exports = { verifyInsuranceApiKey };