const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { VALID_APPOINTMENT_STATUSES_OBJECT } = require("../../validations/appointment/appointmentValidations");
const { HospitalStaffService } = require("../Hospital/HospitalStaffService");
const { DoctorService } = require("../Doctor/DoctorService");

class DashboardStatsService {
    static async getCount(queryText, values = []) {
        const result = await DatabaseService.query(queryText, values);
        return Number(result.rows?.[0]?.count || 0);
    }

    static toStatusMap(rows = []) {
        const statusMap = {};
        for (const row of rows) {
            statusMap[row.status] = Number(row.count || 0);
        }
        return statusMap;
    }

    static async getAppointmentStatusCounts(whereClause = "", values = []) {
        const query = {
            text: `SELECT status, COUNT(*)::int AS count
            FROM appointment
            ${whereClause}
            GROUP BY status`,
            values,
        };
        const result = await DatabaseService.query(query.text, query.values);
        return this.toStatusMap(result.rows || []);
    }

    static async getClaimStatusCounts(whereClause = "", values = []) {
        const query = {
            text: `SELECT claim_status AS status, COUNT(*)::int AS count
            FROM bill
            WHERE is_claim = TRUE
            ${whereClause}
            GROUP BY claim_status`,
            values,
        };
        const result = await DatabaseService.query(query.text, query.values);
        return this.toStatusMap(result.rows || []);
    }

    static async getEhrAccessStatusCounts(whereClause = "", values = []) {
        const query = {
            text: `SELECT status, COUNT(*)::int AS count
            FROM ehr_access
            ${whereClause}
            GROUP BY status`,
            values,
        };
        const result = await DatabaseService.query(query.text, query.values);
        return this.toStatusMap(result.rows || []);
    }

    static async getAppointmentWindowStats(whereClause = "", values = []) {
        const query = {
            text: `SELECT
                COUNT(*) FILTER (WHERE date = CURRENT_DATE)::int AS today,
                COUNT(*) FILTER (WHERE date >= CURRENT_DATE - INTERVAL '6 days' AND date <= CURRENT_DATE)::int AS week,
                COUNT(*) FILTER (WHERE date >= date_trunc('month', CURRENT_DATE) AND date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'))::int AS month,
                COUNT(*) FILTER (WHERE date >= date_trunc('year', CURRENT_DATE) AND date < (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year'))::int AS year
            FROM appointment
            ${whereClause}`,
            values,
        };

        const result = await DatabaseService.query(query.text, query.values);
        const row = result.rows?.[0] || {};
        return {
            today: Number(row.today || 0),
            week: Number(row.week || 0),
            month: Number(row.month || 0),
            year: Number(row.year || 0),
        };
    }

    static async getSuperAdminSummary() {
        const [
            totalAppointments,
            totalHospitals,
            totalInsuranceCompanies,
            totalPatients,
            totalDoctors,
            totalHospitalStaff,
            totalClaims,
            totalEhrAccessRequests,
            totalSystemSubAdmins,
            activeSystemSubAdmins,
            deactivatedSystemSubAdmins,
            verifiedSystemSubAdmins,
            pendingSystemSubAdmins,
            totalHospitalAdmins,
            activeHospitalAdmins,
            deactivatedHospitalAdmins,
            verifiedHospitalAdmins,
            pendingHospitalAdmins,
            appointmentsByStatus,
            claimsByStatus,
            ehrAccessByStatus,
            appointmentWindows,
        ] = await Promise.all([
            this.getCount("SELECT COUNT(*)::int AS count FROM appointment"),
            this.getCount("SELECT COUNT(*)::int AS count FROM hospital"),
            this.getCount("SELECT COUNT(*)::int AS count FROM insurance_company"),
            this.getCount("SELECT COUNT(*)::int AS count FROM patient"),
            this.getCount("SELECT COUNT(*)::int AS count FROM doctor"),
            this.getCount("SELECT COUNT(*)::int AS count FROM hospital_staff"),
            this.getCount("SELECT COUNT(*)::int AS count FROM bill WHERE is_claim = TRUE"),
            this.getCount("SELECT COUNT(*)::int AS count FROM ehr_access"),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM system_admin sa
                JOIN person p ON p.person_id = sa.system_admin_id
                WHERE sa.role = $1`, [VALID_ROLES_OBJECT.ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM system_admin sa
                JOIN person p ON p.person_id = sa.system_admin_id
                WHERE sa.role = $1 AND p.is_deleted = FALSE`, [VALID_ROLES_OBJECT.ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM system_admin sa
                JOIN person p ON p.person_id = sa.system_admin_id
                WHERE sa.role = $1 AND p.is_deleted = TRUE`, [VALID_ROLES_OBJECT.ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM system_admin sa
                JOIN person p ON p.person_id = sa.system_admin_id
                WHERE sa.role = $1 AND p.is_verified = TRUE`, [VALID_ROLES_OBJECT.ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM system_admin sa
                JOIN person p ON p.person_id = sa.system_admin_id
                WHERE sa.role = $1 AND p.is_verified = FALSE`, [VALID_ROLES_OBJECT.ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM hospital_staff hs
                JOIN person p ON p.person_id = hs.hospital_staff_id
                WHERE hs.role = $1`, [VALID_ROLES_OBJECT.HOSPITAL_ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM hospital_staff hs
                JOIN person p ON p.person_id = hs.hospital_staff_id
                WHERE hs.role = $1 AND p.is_deleted = FALSE`, [VALID_ROLES_OBJECT.HOSPITAL_ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM hospital_staff hs
                JOIN person p ON p.person_id = hs.hospital_staff_id
                WHERE hs.role = $1 AND p.is_deleted = TRUE`, [VALID_ROLES_OBJECT.HOSPITAL_ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM hospital_staff hs
                JOIN person p ON p.person_id = hs.hospital_staff_id
                WHERE hs.role = $1 AND p.is_verified = TRUE`, [VALID_ROLES_OBJECT.HOSPITAL_ADMIN]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM hospital_staff hs
                JOIN person p ON p.person_id = hs.hospital_staff_id
                WHERE hs.role = $1 AND p.is_verified = FALSE`, [VALID_ROLES_OBJECT.HOSPITAL_ADMIN]),
            this.getAppointmentStatusCounts(),
            this.getClaimStatusCounts(),
            this.getEhrAccessStatusCounts(),
            this.getAppointmentWindowStats(),
        ]);

        return {
            scope: "system",
            totalAppointments,
            appointmentsByStatus,
            totalHospitals,
            totalInsuranceCompanies,
            totalPatients,
            totalDoctors,
            totalHospitalStaff,
            totalClaims,
            totalEhrAccessRequests,
            totalSystemSubAdmins,
            activeSystemSubAdmins,
            deactivatedSystemSubAdmins,
            verifiedSystemSubAdmins,
            pendingSystemSubAdmins,
            totalHospitalAdmins,
            activeHospitalAdmins,
            deactivatedHospitalAdmins,
            verifiedHospitalAdmins,
            pendingHospitalAdmins,
            claimsByStatus,
            ehrAccessByStatus,
            appointmentWindows,
        };
    }

    static async getHospitalScopedSummary(person_id) {
        const hospitalStaff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
        if (!hospitalStaff) {
            throw new AppError("Hospital staff not found", STATUS_CODES.FORBIDDEN);
        }

        const { hospital_id } = hospitalStaff;

        const [
            totalAppointments,
            appointmentsByStatus,
            totalDoctors,
            totalHospitalStaff,
            totalClaims,
            claimsByStatus,
            totalEhrAccessRequests,
            ehrAccessByStatus,
            appointmentWindows,
        ] = await Promise.all([
            this.getCount("SELECT COUNT(*)::int AS count FROM appointment WHERE hospital_id = $1", [hospital_id]),
            this.getAppointmentStatusCounts("WHERE hospital_id = $1", [hospital_id]),
            this.getCount("SELECT COUNT(*)::int AS count FROM doctor WHERE hospital_id = $1", [hospital_id]),
            this.getCount("SELECT COUNT(*)::int AS count FROM hospital_staff WHERE hospital_id = $1", [hospital_id]),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM bill b
                JOIN appointment a ON a.appointment_id = b.appointment_id
                WHERE b.is_claim = TRUE AND a.hospital_id = $1`, [hospital_id]),
            (async () => {
                const query = {
                    text: `SELECT b.claim_status AS status, COUNT(*)::int AS count
                    FROM bill b
                    JOIN appointment a ON a.appointment_id = b.appointment_id
                    WHERE b.is_claim = TRUE AND a.hospital_id = $1
                    GROUP BY b.claim_status`,
                    values: [hospital_id],
                };
                const result = await DatabaseService.query(query.text, query.values);
                return this.toStatusMap(result.rows || []);
            })(),
            this.getCount(`SELECT COUNT(*)::int AS count
                FROM ehr_access ea
                JOIN doctor d ON d.doctor_id = ea.doctor_id
                WHERE d.hospital_id = $1`, [hospital_id]),
            (async () => {
                const query = {
                    text: `SELECT ea.status AS status, COUNT(*)::int AS count
                    FROM ehr_access ea
                    JOIN doctor d ON d.doctor_id = ea.doctor_id
                    WHERE d.hospital_id = $1
                    GROUP BY ea.status`,
                    values: [hospital_id],
                };
                const result = await DatabaseService.query(query.text, query.values);
                return this.toStatusMap(result.rows || []);
            })(),
            this.getAppointmentWindowStats("WHERE hospital_id = $1", [hospital_id]),
        ]);

        return {
            scope: "hospital",
            hospital_id,
            totalAppointments,
            appointmentsByStatus,
            totalDoctors,
            totalHospitalStaff,
            totalClaims,
            claimsByStatus,
            totalEhrAccessRequests,
            ehrAccessByStatus,
            appointmentWindows,
        };
    }

    static async getDoctorScopedSummary(person_id) {
        const doctor = await DoctorService.getDoctorIfExists(person_id);
        if (!doctor) {
            throw new AppError("Doctor not found", STATUS_CODES.FORBIDDEN);
        }

        if (!doctor.hospital_id) {
            return {
                scope: "doctor",
                doctor_id: person_id,
                hospital_id: null,
                totalAppointments: 0,
                appointmentsByStatus: {},
                totalEhrAccessRequests: 0,
                ehrAccessByStatus: {},
                appointmentWindows: {
                    today: 0,
                    week: 0,
                    month: 0,
                    year: 0,
                },
            };
        }

        const values = [person_id, doctor.hospital_id];
        const doctorNonPendingValues = [person_id, doctor.hospital_id, VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING, 'pending'];
        const [totalAppointments, appointmentsByStatus, totalEhrAccessRequests, ehrAccessByStatus, appointmentWindows] = await Promise.all([
            this.getCount(
                "SELECT COUNT(*)::int AS count FROM appointment WHERE doctor_id = $1 AND hospital_id = $2 AND status NOT IN ($3, $4)",
                doctorNonPendingValues
            ),
            this.getAppointmentStatusCounts("WHERE doctor_id = $1 AND hospital_id = $2 AND status NOT IN ($3, $4)", doctorNonPendingValues),
            this.getCount(
                "SELECT COUNT(*)::int AS count FROM ehr_access WHERE doctor_id = $1",
                [person_id]
            ),
            this.getEhrAccessStatusCounts("WHERE doctor_id = $1", [person_id]),
            this.getAppointmentWindowStats("WHERE doctor_id = $1 AND hospital_id = $2", values),
        ]);

        return {
            scope: "doctor",
            doctor_id: person_id,
            hospital_id: doctor.hospital_id,
            totalAppointments,
            appointmentsByStatus,
            totalEhrAccessRequests,
            ehrAccessByStatus,
            appointmentWindows,
        };
    }

    static async getSummaryForUser(person_id, role) {
        if (!person_id) {
            throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
        }

        if (!role) {
            throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
        }

        if (role === VALID_ROLES_OBJECT.SUPER_ADMIN || role === VALID_ROLES_OBJECT.ADMIN) {
            return this.getSuperAdminSummary();
        }

        if (
            role === VALID_ROLES_OBJECT.HOSPITAL_ADMIN ||
            role === VALID_ROLES_OBJECT.HOSPITAL_SUB_ADMIN ||
            role === VALID_ROLES_OBJECT.HOSPITAL_FRONT_DESK ||
            role === VALID_ROLES_OBJECT.HOSPITAL_LAB_TECHNICIAN ||
            role === VALID_ROLES_OBJECT.HOSPITAL_PHARMACIST
        ) {
            return this.getHospitalScopedSummary(person_id);
        }

        if (role === VALID_ROLES_OBJECT.DOCTOR) {
            return this.getDoctorScopedSummary(person_id);
        }

        throw new AppError("Role not supported for dashboard stats", STATUS_CODES.FORBIDDEN);
    }
}

module.exports = { DashboardStatsService };
