const { DOCTOR_LICENSE_NUMBER_MAX_LENGTH, DOCTOR_SPECIALIZATION_MAX_LENGTH, DOCTOR_YEARS_OF_EXPERIENCE_MAX, DOCTOR_STATUS_MAX_LENGTH, VALID_DOCTOR_STATUSES_OBJECT, VALID_DOCTOR_STATUSES } = require("../../utils/validConstantsUtil");

const doctorTableQuery = `
    CREATE TABLE IF NOT EXISTS doctor (
        doctor_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        license_number VARCHAR(${DOCTOR_LICENSE_NUMBER_MAX_LENGTH}) UNIQUE,
        specialization VARCHAR(${DOCTOR_SPECIALIZATION_MAX_LENGTH}),
        years_of_experience INTEGER CHECK (years_of_experience >= 0 AND years_of_experience <= ${DOCTOR_YEARS_OF_EXPERIENCE_MAX}),
        sitting_start TIME CHECK (sitting_start < sitting_end),
        sitting_end TIME CHECK (sitting_end > sitting_start),
        status VARCHAR(${DOCTOR_STATUS_MAX_LENGTH}) CHECK (status IN (${VALID_DOCTOR_STATUSES.map(status => `'${status}'`).join(', ')})) DEFAULT '${VALID_DOCTOR_STATUSES_OBJECT.ACTIVE}' NOT NULL,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE DEFAULT NULL,
        is_profile_complete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS doctor_view;

    CREATE VIEW doctor_view AS
    SELECT 
        d.doctor_id,
        d.license_number,
        d.specialization,
        d.years_of_experience,
        d.sitting_start,
        d.sitting_end,
        d.status AS doctor_status,
        d.hospital_id,
        h.name AS hospital_name,
        d.is_profile_complete AS is_doctor_profile_complete
    FROM doctor d
    LEFT JOIN hospital h ON d.hospital_id = h.hospital_id;

    CREATE INDEX IF NOT EXISTS idx_doctor_doctor_id ON doctor(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_doctor_license_number ON doctor(license_number);
    CREATE INDEX IF NOT EXISTS idx_doctor_specialization ON doctor(specialization);
    CREATE INDEX IF NOT EXISTS idx_doctor_years_of_experience ON doctor(years_of_experience);
    CREATE INDEX IF NOT EXISTS idx_doctor_status ON doctor(status);
    CREATE INDEX IF NOT EXISTS idx_doctor_hospital_id ON doctor(hospital_id);

    DROP TRIGGER IF EXISTS trg_update_doctor_updated_at ON doctor;

    CREATE TRIGGER trg_update_doctor_updated_at
    BEFORE UPDATE ON doctor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { VALID_DOCTOR_STATUSES, doctorTableQuery };