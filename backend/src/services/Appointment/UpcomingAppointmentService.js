const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class UpcomingAppointmentService {
    static async getUpcomingAppointments() {
    try {
      const today = new Date();
      const todayDate = today.toISOString().split("T")[0];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split("T")[0];

      const query = {
        text: `SELECT
              a.appointment_id,
              ar.doctor_id,
              ar.patient_id,
              TO_CHAR(ar.date, 'YYYY-MM-DD') AS date,
              TO_CHAR(ar.time, 'HH24:MI') AS time,
              ar.reason,
              h.name AS hospital_name,
              ad.address AS hospital_address,
              p.first_name AS patient_first_name,
              p.last_name AS patient_last_name,
              p.email AS patient_email,
              d.first_name AS doctor_first_name,
              d.last_name AS doctor_last_name,
              d.email AS doctor_email
              FROM appointment a
              JOIN appointment_request ar ON a.appointment_id = ar.appointment_request_id
              JOIN hospital h ON ar.hospital_id = h.hospital_id
              JOIN address ad ON h.address_id = ad.address_id
              JOIN person p ON ar.patient_id = p.person_id
              JOIN person d ON ar.doctor_id = d.person_id
              WHERE
              (ar.date = $1 OR ar.date = $2)
              AND a.status = 'upcoming'
              ORDER BY
              ar.date ASC, ar.time ASC`,
        values: [todayDate, tomorrowDate],
      };
      const result = await pool.query(query);
      if (result.rows.length === 0) {
        throw new AppError(
          "No upcoming appointments found",
          statusCodes.NOT_FOUND
        );
      }

      return result.rows;
    } catch (error) {
      console.error(
        `Error fetching upcoming appointments: ${error.message} ${error.status}`
      );
      throw error;
    }
  }
}

module.exports = { UpcomingAppointmentService };