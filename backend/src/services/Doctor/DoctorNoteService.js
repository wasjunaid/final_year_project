const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class DoctorNoteService {
    static async getDoctorNoteAgainstAppointment(appointment_id) {
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `
                    SELECT * FROM doctor_note
                    WHERE
                    appointment_id = $1
                `,
                values: [appointment_id],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No Doctor Note Found", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error getting doctor note: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertDoctorNote(appointment_id, note) {
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }
        if (!note) {
            throw new AppError("note is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `
                    INSERT INTO doctor_note
                    (appointment_id, note)
                    VALUES
                    ($1, $2)
                    RETURNING *
                `,
                values: [appointment_id, note],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to insert Doctor Note", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting doctor note: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { DoctorNoteService };