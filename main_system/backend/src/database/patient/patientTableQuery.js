const { BLOOD_GROUP_MAX_LENGTH, VALID_BLOOD_GROUPS } = require("../../utils/validConstantsUtil");
const {
    PATIENT_CONFIG,
    VALID_SMOKING_STATUSES,
    VALID_ALCOHOL_STATUSES,
    VALID_DRUG_USE_STATUSES
} = require("../../validations/patient/patientValidations");

const patientTableQuery = `
    CREATE TABLE IF NOT EXISTS patient (
        patient_id INTEGER REFERENCES person(person_id) ON DELETE CASCADE PRIMARY KEY,
        emergency_contact_id INTEGER REFERENCES contact(contact_id) DEFAULT NULL,
        blood_group VARCHAR(${BLOOD_GROUP_MAX_LENGTH}) CHECK (blood_group IN (${VALID_BLOOD_GROUPS.map(blood_group => `'${blood_group}'`).join(', ')})) DEFAULT NULL,

        smoking varchar(${PATIENT_CONFIG.SMOKING_MAX_LENGTH}) CHECK (smoking IN (${VALID_SMOKING_STATUSES.map(status => `'${status}'`).join(', ')})) DEFAULT NULL,
        alcohol varchar(${PATIENT_CONFIG.ALCOHOL_MAX_LENGTH}) CHECK (alcohol IN (${VALID_ALCOHOL_STATUSES.map(status => `'${status}'`).join(', ')})) DEFAULT NULL,
        drug_use varchar(${PATIENT_CONFIG.DRUG_USE_MAX_LENGTH}) CHECK (drug_use IN (${VALID_DRUG_USE_STATUSES.map(status => `'${status}'`).join(', ')})) DEFAULT NULL,

        wallet_address VARCHAR(255) DEFAULT NULL,

        is_profile_complete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS patient_view;

    CREATE VIEW patient_view AS
    SELECT 
        p.patient_id,
        p.emergency_contact_id,
        c.country_code AS emergency_contact_country_code,
        c.number AS emergency_contact_number,
        p.blood_group,
        p.smoking,
        p.alcohol,
        p.drug_use,
        p.wallet_address,
        p.is_profile_complete AS is_patient_profile_complete
    FROM patient p
    LEFT JOIN contact c ON p.emergency_contact_id = c.contact_id;

    CREATE INDEX IF NOT EXISTS idx_patient_patient_id ON patient(patient_id);

    DROP TRIGGER IF EXISTS trg_update_patient_updated_at ON patient;

    CREATE TRIGGER trg_update_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { patientTableQuery };