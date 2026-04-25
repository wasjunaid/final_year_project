const { STATUS_CODES } = require('../../utils/statusCodesUtil');
const { AppError } = require('../../classes/AppErrorClass');
const { validateID } = require("../../utils/idUtil");

const PRESCRIPTION_CONFIG = {
    PRESCRIPTION_DOSAGE_MAX_LENGTH: 255
}

/**
 * Validates ID fields for prescription-related operations.
 * @param {object} params - The parameters containing IDs to validate.
 * @param {number} [params.person_id] - The ID of the person (hospital staff).
 * @param {number} [params.patient_id] - The ID of the patient.
 * @param {number} [params.appointment_id] - The ID of the appointment.
 * @param {number} [params.medicine_id] - The ID of the medicine.
 * @returns {object} The normalized IDs.
 * @throws {AppError} if any ID is invalid.
 */
const validateIDFieldsForPrescription = ({ person_id, patient_id, appointment_id, medicine_id, prescription_id }) => {
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

    if (appointment_id !== undefined) {
        try {
            res.appointment_id = validateID(appointment_id);
        } catch (error) {
            throw error;
        }
    }

    if (medicine_id !== undefined) {
        try {
            res.medicine_id = validateID(medicine_id);
        } catch (error) {
            throw error;
        }
    }

    if (prescription_id !== undefined) {
        try {
            res.prescription_id = validateID(prescription_id);
        } catch (error) {
            throw error;
        }
    }

    return res;
}

/** * Validates fields for retrieving prescriptions against an appointment.
 * @param {object} params - The parameters to validate.
 * @param {number} params.patient_id - The ID of the patient.
 * @param {object} params.appointment - The appointment object.
 * @throws {AppError} if any validation fails.
 */
const validateFieldsForGetPrescriptionsAgainstAppointment = ({ patient_id, appointment }) => {
    if (!patient_id) {
        throw new AppError('patient_id is required', STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError('appointment is required', STATUS_CODES.BAD_REQUEST);
    }

    if (appointment.patient_id !== patient_id) {
        throw new AppError('Appointment does not belong to the given patient', STATUS_CODES.FORBIDDEN);
    }
}

/** * Validates fields for inserting a new prescription.
 * @param {object} params - The parameters to validate.
 * @param {object} params.hospitalStaff - The hospital staff object creating the prescription.
 * @param {object} params.appointment - The appointment object.
 * @param {string} params.dosage - The dosage instructions.
 * @param {string} params.instruction - Additional instructions.
 * @returns {object} The normalized dosage and instruction.
 * @throws {AppError} if any validation fails.
 */
const validateFieldsForInsertPrescription = ({ hospitalStaff, appointment, dosage, instruction, prescription_date }) => {
    if (!hospitalStaff) {
        throw new AppError('hospitalStaff is required', STATUS_CODES.BAD_REQUEST);
    }

    if (!appointment) {
        throw new AppError('appointment is required', STATUS_CODES.BAD_REQUEST);
    }

    if (!dosage) {
        throw new AppError('dosage is required', STATUS_CODES.BAD_REQUEST);
    }

    if (!instruction) {
        throw new AppError('instruction is required', STATUS_CODES.BAD_REQUEST);
    }

    if (appointment.hospital_id !== hospitalStaff.hospital_id) {
        throw new AppError('Appointment does not belong to the same hospital as the staff', STATUS_CODES.FORBIDDEN);
    }

    if (typeof dosage !== 'string') {
        throw new AppError('dosage must be a string', STATUS_CODES.BAD_REQUEST);
    }

    dosage = dosage.trim();

    if (dosage.length === 0) {
        throw new AppError('dosage cannot be empty', STATUS_CODES.BAD_REQUEST);
    }

    if (dosage.length > PRESCRIPTION_CONFIG.PRESCRIPTION_DOSAGE_MAX_LENGTH) {
        throw new AppError(`dosage cannot exceed ${PRESCRIPTION_CONFIG.PRESCRIPTION_DOSAGE_MAX_LENGTH} characters`, STATUS_CODES.BAD_REQUEST);
    }

    if (typeof instruction !== 'string') {
        throw new AppError('instruction must be a string', STATUS_CODES.BAD_REQUEST);
    }

    instruction = instruction.trim();

    if (instruction.length === 0) {
        throw new AppError('instruction cannot be empty', STATUS_CODES.BAD_REQUEST);
    }

    if (!prescription_date) {
        throw new AppError('prescription_date is required', STATUS_CODES.BAD_REQUEST);
    }

    if (isNaN(Date.parse(prescription_date))) {
        throw new AppError('prescription_date must be a valid date', STATUS_CODES.BAD_REQUEST);
    }

    return { dosage, instruction };
}

module.exports = {
    PRESCRIPTION_CONFIG,
    validateIDFieldsForPrescription,
    validateFieldsForGetPrescriptionsAgainstAppointment,
    validateFieldsForInsertPrescription
};