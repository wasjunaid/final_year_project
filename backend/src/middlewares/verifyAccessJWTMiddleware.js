const { JWTConfig } = require("../config/JWTConfig");
const jwt = require("jsonwebtoken");
const { statusCodes } = require("../utils/statusCodesUtil");

const verifyAccessJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(statusCodes.UNAUTHORIZED).json({
            data: null,
            message: "No Token Provided",
            status: statusCodes.UNAUTHORIZED,
            success: false
        });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWTConfig.accessSecret);
        
        req.user = {
            person_id: decoded.person_id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(statusCodes.UNAUTHORIZED).json({
            data: null,
            message: "Invalid or Expired Token",
            status: statusCodes.UNAUTHORIZED,
            success: false
        });
    }
};

module.exports = { verifyAccessJWT };