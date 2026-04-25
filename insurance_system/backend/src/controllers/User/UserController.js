const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { UserService } = require("../../services/User/UserService");
const { validateID } = require("../../utils/idUtil");

class UserController {
    async getUsersIfExists(req, res) {
        try {
            const users = await UserService.getUsersIfExists();
            if (!users) {
                throw new AppError("No users found", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: users,
                message: "Users retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in UserController.getUsersIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const { user_id } = req.params;

            if (!user_id) {
                throw new AppError("user_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedUserID = validateID(user_id);

            await UserService.deleteUser(validatedUserID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "User deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in UserController.deleteUser: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new UserController();