const { DatabaseService } = require("../DatabaseService");
const { VALID_APPOINTMENT_STATUSES_OBJECT } = require("../../validations/appointment/appointmentValidations");

class UpcomingAppointmentService {
    /**
     * Retrieves upcoming appointments (today and tomorrow) if any exist.
     * @returns {Promise<Array|boolean>} Array of upcoming appointments or false if none exist.
     * @throws {AppError} if any issue occurs
     */
    static async getUpcomingAppointmentsIfExists() {
        try {
            const today = new Date();
            const todayDate = today.toISOString().split("T")[0];

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowDate = tomorrow.toISOString().split("T")[0];

            const query = {
                text: `SELECT * FROM appointment_view
                WHERE
                (date = $1 OR date = $2)
                AND status = ${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}
                ORDER BY
                date ASC, time ASC`,
                values: [todayDate, tomorrowDate],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(
                `Error in UpcomingAppointmentService.getUpcomingAppointmentsIfExists: ${error.message} ${error.status}`
            );
            throw error;
        }
    }
}

module.exports = { UpcomingAppointmentService };