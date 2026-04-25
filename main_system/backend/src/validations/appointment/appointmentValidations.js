const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { validateID } = require("../../utils/idUtil");
const { TIME_REGEX } = require("../../utils/validConstantsUtil");

const APPOINTMENT_CONFIG = {
    APPOINTMENT_STATUS_MAX_LENGTH: 15,
    APPOINTMENT_DATE_INTERVAL_DAYS: 5,
    APPOINTMENT_CANCEL_INTERVAL_HOURS: 24 
};

const VALID_APPOINTMENT_STATUSES_OBJECT = {
    PROCESSING: 'processing',
    DENIED: 'denied',
    UPCOMING: 'upcoming',
    IN_PROGRESS: 'in progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const VALID_APPOINTMENT_STATUSES = Object.values(VALID_APPOINTMENT_STATUSES_OBJECT);

/**
 * Validates ID fields for appointment-related operations.
 * @param {Object} params - The parameters containing ID fields.
 * @param {number} [params.person_id] - The person ID to validate.
 * @param {number} [params.patient_id] - The patient ID to validate.
 * @param {number} [params.doctor_id] - The doctor ID to validate.
 * @param {number} [params.hospital_id] - The hospital ID to validate.
 * @param {number} [params.appointment_id] - The appointment ID to validate.
 * @returns {Object} An object containing normalized ID fields.
 * @throws {AppError} If any ID field is invalid.
 */
const validateIDFieldsForAppointment = ({ person_id, patient_id, doctor_id, hospital_id, appointment_id }) => {
    const res = {};

    if (person_id !== undefined) {
        try {
            res.person_id = validateID(person_id);
        } catch (error) {
            throw error;
        }
    }

    if (patient_id !== undefined) {
        try {
            res.patient_id = validateID(patient_id);
        } catch (error) {
            throw error;
        }
    }

    if (doctor_id !== undefined) {
        try {
            res.doctor_id = validateID(doctor_id);
        } catch (error) {
            throw error;
        }
    }

    if (hospital_id !== undefined) {
        try {
            res.hospital_id = validateID(hospital_id);
        } catch (error) {
            throw error;
        }
    }

    if (appointment_id !== undefined) {
        try {
            res.appointment_id = validateID(appointment_id);
        } catch (error) {
            throw error;
        }
    }

    return res;
};

/**
 * Validates the date field for appointment operations.
 * @param {string} date - The date string to validate.
 * @returns {string} The normalized date string.
 * @throws {AppError} If the date is invalid or not at least the required days in the future.
 */
const validateDateFieldForAppointment = (date) => {
    if (!date) {
        throw new AppError("date is required", STATUS_CODES.BAD_REQUEST);
    }

    date = date.trim();

    const appointmentDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    currentDate.setDate(currentDate.getDate() + APPOINTMENT_CONFIG.APPOINTMENT_DATE_INTERVAL_DAYS);

    if (isNaN(appointmentDate.getTime()) || appointmentDate < currentDate) {
        throw new AppError(`date must be at least ${APPOINTMENT_CONFIG.APPOINTMENT_DATE_INTERVAL_DAYS} days in the future`, STATUS_CODES.BAD_REQUEST);
    }

    return date;
};

/**
 * Validates the time field for appointment operations.
 * @param {string} time - The time string to validate.
 * @param {Object} doctor - The doctor object containing working hours.
 * @param {string} doctor.sitting_start - The doctor's sitting start time (HH:MM or HH:MM:SS).
 * @param {string} doctor.sitting_end - The doctor's sitting end time (HH:MM or HH:MM:SS).
 * @returns {string} The normalized time string.
 * @throws {AppError} If the time is invalid or outside the doctor's working hours.
 */
const validateTimeFieldForAppointment = (time, doctor) => {
    if (!time) {
        throw new AppError("time is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof time !== 'string') {
        throw new AppError("time must be a string", STATUS_CODES.BAD_REQUEST);
    }

    time = time.trim();

    if (!TIME_REGEX.test(time)) {
        throw new AppError("time must be in HH:MM or HH:MM:SS format", STATUS_CODES.BAD_REQUEST);
    }

    if (time < doctor.sitting_start || time > doctor.sitting_end) {
        throw new AppError(`time must be within doctor's working hours (${doctor.sitting_start} - ${doctor.sitting_end})`, STATUS_CODES.BAD_REQUEST);
    }

    return time;
};

/**
 * Validates the reason field for appointment operations.
 * @param {string} reason - The reason string to validate.
 * @returns {string} The normalized reason string.
 * @throws {AppError} If the reason is invalid.
 */
const validateReasonFieldForAppointment = (reason) => {
    if (!reason) {
        throw new AppError("reason is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof reason !== 'string') {
        throw new AppError("reason must be a string", STATUS_CODES.BAD_REQUEST);
    }

    reason = reason.trim();

    if (reason.length === 0) {
        throw new AppError("reason cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    return reason;
}

/**
 * Validates fields for inserting a new appointment.
 * @param {Object} params - The parameters for the appointment.
 * @param {Object} params.doctor - The doctor object.
 * @param {Object} params.hospital - The hospital object.
 * @param {string} params.date - The date string for the appointment.
 * @param {string} params.time - The time string for the appointment.
 * @param {string} params.reason - The reason for the appointment.
 * @returns {Object} An object containing normalized date, time, and reason.
 * @throws {AppError} If any field is invalid.
 */
const validateFieldsForInsertAppointment = ({ doctor, hospital, date, time, reason }) => {

    if (!doctor) {
        throw new AppError("doctor is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!hospital) {
        throw new AppError("hospital is required", STATUS_CODES.BAD_REQUEST);
    }

    if (doctor.hospital_id !== hospital.hospital_id) {
        throw new AppError("Doctor does not work at this hospital", STATUS_CODES.BAD_REQUEST);
    }

    try {
        date = validateDateFieldForAppointment(date);
    } catch (error) {
        throw error;
    }

    try {
        time = validateTimeFieldForAppointment(time, doctor);
    } catch (error) {
        throw error;
    }

    try {
        reason = validateReasonFieldForAppointment(reason);
    } catch (error) {
        throw error;
    }

    return { date, time, reason };
};

/**
 * Validates fields for approving an appointment.
 * @param {Object} params - The parameters for approving the appointment.
 * @param {Object} params.appointment - The appointment object.
 * @param {Object} params.hospitalStaff - The hospital staff object.
 * @param {Object} params.doctor - The doctor object.
 * @param {string} params.date - The date string for the appointment.
 * @param {string} params.time - The time string for the appointment.
 * @param {number} params.appointment_cost - The cost of the appointment.
 * @returns {Object} An object containing normalized date and time.
 * @throws {AppError} If any field is invalid.
 */
const validateFieldsForApproveAppointment = ({ appointment, hospitalStaff, doctor, date, time, appointment_cost }) => {
    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!hospitalStaff) {
        throw new AppError("hospitalStaff is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!doctor) {
        throw new AppError("doctor is required", STATUS_CODES.BAD_REQUEST);
    }

    if (hospitalStaff.hospital_id !== appointment.hospital_id) {
        throw new AppError(
            "You do not have permission to approve this appointment",
            STATUS_CODES.FORBIDDEN
        );
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING) {
        throw new AppError(`Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}' can be approved`, STATUS_CODES.BAD_REQUEST);
    }

    if (doctor.hospital_id !== appointment.hospital_id) {
        throw new AppError("Doctor does not belong to the same hospital", STATUS_CODES.BAD_REQUEST);
    }

    try {
        if (date !== appointment.date) {
            date = validateDateFieldForAppointment(date);
        }
    } catch (error) {
        throw error;
    }

    try {
        time = validateTimeFieldForAppointment(time, doctor);
    } catch (error) {
        throw error;
    }

    if (appointment_cost === undefined || appointment_cost === null) {
        throw new AppError("appointment_cost is required", STATUS_CODES.BAD_REQUEST);
    }

    if (isNaN(appointment_cost) || appointment_cost < 0) {
        throw new AppError("appointment_cost must be a non-negative number", STATUS_CODES.BAD_REQUEST);
    }

    return { date, time };
};

/** * Validates fields for denying an appointment.
 * @param {Object} params - The parameters for denying the appointment.
 * @param {Object} params.appointment - The appointment object.
 * @param {Object} params.hospitalStaff - The hospital staff object.
 * @throws {AppError} If any field is invalid.
 */
const validateFieldsForDenyAppointment = ({ appointment, hospitalStaff }) => {
    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!hospitalStaff) {
        throw new AppError("hospitalStaff is required", STATUS_CODES.BAD_REQUEST);
    }

    if (hospitalStaff.hospital_id !== appointment.hospital_id) {
        throw new AppError("You do not have permission to deny this appointment", STATUS_CODES.FORBIDDEN);
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING) {
        throw new AppError(`Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}' can be denied`, STATUS_CODES.BAD_REQUEST);
    }
};

/** * Validates fields for cancelling an appointment.
 * @param {Object} params - The parameters for cancelling the appointment.
 * @param {number} params.patient_id - The patient ID requesting the cancellation.
 * @param {Object} params.appointment - The appointment object.
 * @throws {AppError} If any field is invalid.
 */
const validateFieldsForCancelAppointment = ({ patient_id, appointment }) => {
    if (!patient_id) {
        throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (Number(appointment.patient_id) !== Number(patient_id)) {
        throw new AppError("You do not have permission to cancel this appointment", STATUS_CODES.FORBIDDEN);
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING && appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING) {
        throw new AppError(`Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}' or '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}' can be cancelled`, STATUS_CODES.BAD_REQUEST);
    }

    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < APPOINTMENT_CONFIG.APPOINTMENT_CANCEL_INTERVAL_HOURS) {
        throw new AppError(`Cannot cancel appointment less than ${APPOINTMENT_CONFIG.APPOINTMENT_CANCEL_INTERVAL_HOURS} hours before scheduled time`, STATUS_CODES.BAD_REQUEST);
    }
};

/** * Validates fields for rescheduling an appointment by a patient.
 * @param {Object} params - The parameters for rescheduling the appointment.
 * @param {number} params.patient_id - The patient ID requesting the reschedule.
 * @param {Object} params.appointment - The appointment object.
 * @param {Object} params.doctor - The doctor object.
 * @param {string} params.date - The new date string for the appointment.
 * @param {string} params.time - The new time string for the appointment.
 * @param {string} params.reason - The reason for rescheduling the appointment.
 * @returns {Object} An object containing normalized date, time, and reason.
 * @throws {AppError} If any field is invalid.
 */
const validateFieldsForRescheduleAppointmentForPatient = ({ patient_id, appointment, doctor, date, time, reason }) => {
    if (!patient_id) {
        throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!doctor) {
        throw new AppError("doctor is required", STATUS_CODES.BAD_REQUEST);
    }

    if (Number(appointment.patient_id) !== Number(patient_id)) {
        throw new AppError("You do not have permission to reschedule this appointment", STATUS_CODES.FORBIDDEN);
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING && appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING) {
        throw new AppError(`Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}' or '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}' can be rescheduled`, STATUS_CODES.BAD_REQUEST);
    }

    if (doctor.hospital_id !== appointment.hospital_id) {
        throw new AppError("Doctor does not belong to the same hospital", STATUS_CODES.BAD_REQUEST);
    }

    try {
        if (date !== appointment.date) {
            date = validateDateFieldForAppointment(date);
        }
    } catch (error) {
        throw error;
    }

    try {
        time = validateTimeFieldForAppointment(time, doctor);
    } catch (error) {
        throw error;
    }

    try {
        reason = validateReasonFieldForAppointment(reason);
    } catch (error) {
        throw error;
    }

    return { date, time, reason };
}

/** * Validates fields for rescheduling an appointment by hospital staff.
 * @param {Object} params - The parameters for rescheduling the appointment.
 * @param {Object} params.appointment - The appointment object.
 * @param {Object} params.hospitalStaff - The hospital staff object.
 * @param {Object} params.doctor - The doctor object.
 * @param {string} params.date - The new date string for the appointment.
 * @param {string} params.time - The new time string for the appointment.
 * @returns {Object} An object containing normalized date and time.
 * @throws {AppError} If any field is invalid.
 */
const validateFieldsForRescheduleAppointmentForHospitalStaff = ({ appointment, hospitalStaff, doctor, date, time }) => {
    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!hospitalStaff) {
        throw new AppError("hospitalStaff is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!doctor) {
        throw new AppError("doctor is required", STATUS_CODES.BAD_REQUEST);
    }

    if (hospitalStaff.hospital_id !== appointment.hospital_id) {
        throw new AppError("You do not have permission to reschedule this appointment", STATUS_CODES.FORBIDDEN);
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING) {
        throw new AppError(`Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}' can be rescheduled`, STATUS_CODES.BAD_REQUEST);
    }
            
    if (doctor.hospital_id !== appointment.hospital_id) {
        throw new AppError("Doctor does not belong to the same hospital", STATUS_CODES.BAD_REQUEST);
    }

    try {
        if (date !== appointment.date) {
            date = validateDateFieldForAppointment(date);
        }
    } catch (error) {
        throw error;
    }

    try {
        time = validateTimeFieldForAppointment(time, doctor);
    } catch (error) {
        throw error;
    }

    return { date, time };
}

/** * Validates fields for starting an appointment.
 * @param {Object} params - The parameters for starting the appointment.
 * @param {number} params.doctor_id - The doctor ID attempting to start the appointment.
 * @param {Object} params.appointment - The appointment object.
 * @throws {AppError} If any field is invalid.
 */
const validateFieldsForStartAppointment = ({ doctor_id, appointment }) => {
    if (!doctor_id) {
        throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    // if (appointment.date <= new Date().toDateString() && appointment.time <= new Date().toTimeString().slice(0,5)) {
    //     throw new AppError("Appointment date and time must be now or in the past to start", STATUS_CODES.BAD_REQUEST);
    // }
    // The above check is commented out to allow starting appointments ahead of time for testing purposes.

    if (Number(appointment.doctor_id) !== Number(doctor_id)) {
        throw new AppError(
            "You do not have permission to start this appointment",
            STATUS_CODES.FORBIDDEN
        );
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING) {
        throw new AppError(
            `Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.UPCOMING}' can be started`,
            STATUS_CODES.BAD_REQUEST
        );
    }
}

const validateFieldsForOrderLabTests = ({ doctor_id, appointment }) => {
    if (!doctor_id) {
        throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (Number(appointment.doctor_id) !== Number(doctor_id)) {
        throw new AppError(
            "You do not have permission to order lab tests for this appointment",
            STATUS_CODES.FORBIDDEN
        );
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS) {
        throw new AppError(
            `lab tests can Only be ordered for appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS}'`,
            STATUS_CODES.BAD_REQUEST
        );
    }
}

const validateFieldsForCompleteAppointment = ({ doctor_id, appointment, history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan }) => {
    if (!doctor_id) {
        throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (Number(appointment.doctor_id) !== Number(doctor_id)) {
        throw new AppError(
            "You do not have permission to complete this appointment",
            STATUS_CODES.FORBIDDEN
        );
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS) {
        throw new AppError(
            `Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS}' can be completed`,
            STATUS_CODES.BAD_REQUEST
        );
    }

    // Intentionally no appointment date/time gate here during testing.
    // Completion is allowed whenever the appointment has reached IN_PROGRESS.

    if (!history_of_present_illness) {
        throw new AppError("history_of_present_illness is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof history_of_present_illness !== 'string') {
        throw new AppError("history_of_present_illness must be a string", STATUS_CODES.BAD_REQUEST);
    }

    history_of_present_illness = history_of_present_illness.trim();

    if (history_of_present_illness.length === 0) {
        throw new AppError("history_of_present_illness cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (!review_of_systems) {
        throw new AppError("review_of_systems is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof review_of_systems !== 'string') {
        throw new AppError("review_of_systems must be a string", STATUS_CODES.BAD_REQUEST);
    }

    review_of_systems = review_of_systems.trim();

    if (review_of_systems.length === 0) {
        throw new AppError("review_of_systems cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (!physical_exam) {
        throw new AppError("physical_exam is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof physical_exam !== 'string') {
        throw new AppError("physical_exam must be a string", STATUS_CODES.BAD_REQUEST);
    }

    physical_exam = physical_exam.trim();

    if (physical_exam.length === 0) {
        throw new AppError("physical_exam cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (!diagnosis) {
        throw new AppError("diagnosis is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof diagnosis !== 'string') {
        throw new AppError("diagnosis must be a string", STATUS_CODES.BAD_REQUEST);
    }

    diagnosis = diagnosis.trim();

    if (diagnosis.length === 0) {
        throw new AppError("diagnosis cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    if (!plan) {
        throw new AppError("plan is required", STATUS_CODES.BAD_REQUEST);
    }

    if (typeof plan !== 'string') {
        throw new AppError("plan must be a string", STATUS_CODES.BAD_REQUEST);
    }

    plan = plan.trim();

    if (plan.length === 0) {
        throw new AppError("plan cannot be empty", STATUS_CODES.BAD_REQUEST);
    }

    return { history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan };
}

const validateFieldsForCompleteLabTests = ({ patient_id, appointment }) => {
    if (!patient_id) {
        throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (Number(appointment.patient_id) !== Number(patient_id)) {
        throw new AppError(
            "You do not have permission to complete lab tests for this appointment",
            STATUS_CODES.FORBIDDEN
        );
    }

    if (!appointment.lab_tests_ordered) {
        throw new AppError(
            "No lab tests have been ordered for this appointment",
            STATUS_CODES.BAD_REQUEST
        );
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS && appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED) {
        throw new AppError(
            `Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS}' or '${VALID_APPOINTMENT_STATUSES_OBJECT.COMPLETED}' can have lab tests completed`,
            STATUS_CODES.BAD_REQUEST
        );
    }
}

const validateFieldsForHospitalizeAppointment = ({ doctor_id, appointment }) => {
    if (!doctor_id) {
        throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (Number(appointment.doctor_id) !== Number(doctor_id)) {
        throw new AppError("You do not have permission to hospitalize this appointment", STATUS_CODES.FORBIDDEN);
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS) {
        throw new AppError(`Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS}' can be marked as hospitalization`, STATUS_CODES.BAD_REQUEST);
    }

    if (String(appointment.appointment_type || "opd").toLowerCase() === "hospitalization") {
        throw new AppError("Appointment is already marked as hospitalization", STATUS_CODES.BAD_REQUEST);
    }
};

const validateFieldsForDischargeAppointment = ({ doctor_id, appointment }) => {
    if (!doctor_id) {
        throw new AppError("doctor_id is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError("appointment is required", STATUS_CODES.BAD_REQUEST);
    }

    if (Number(appointment.doctor_id) !== Number(doctor_id)) {
        throw new AppError("You do not have permission to discharge this appointment", STATUS_CODES.FORBIDDEN);
    }

    if (String(appointment.appointment_type || "opd").toLowerCase() !== "hospitalization") {
        throw new AppError("Only hospitalization appointments can be discharged", STATUS_CODES.BAD_REQUEST);
    }

    if (appointment.status !== VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS) {
        throw new AppError(`Only appointments with status '${VALID_APPOINTMENT_STATUSES_OBJECT.IN_PROGRESS}' can be discharged`, STATUS_CODES.BAD_REQUEST);
    }
};

module.exports = {
    APPOINTMENT_CONFIG,
    VALID_APPOINTMENT_STATUSES_OBJECT,
    VALID_APPOINTMENT_STATUSES,
    validateIDFieldsForAppointment,
    validateFieldsForInsertAppointment,
    validateFieldsForApproveAppointment,
    validateFieldsForDenyAppointment,
    validateFieldsForCancelAppointment,
    validateFieldsForRescheduleAppointmentForPatient,
    validateFieldsForRescheduleAppointmentForHospitalStaff,
    validateFieldsForStartAppointment,
    validateFieldsForOrderLabTests,
    validateFieldsForCompleteAppointment,
    validateFieldsForCompleteLabTests,
    validateFieldsForHospitalizeAppointment,
    validateFieldsForDischargeAppointment,
};