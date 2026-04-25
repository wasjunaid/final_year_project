const { PRESCRIPTION_CONFIG } = require("../../validations/prescription/prescriptionValidations");

const prescriptionTableQuery = `
    CREATE TABLE IF NOT EXISTS prescription (
        prescription_id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointment(appointment_id) ON DELETE CASCADE,
        medicine_id INTEGER REFERENCES medicine(medicine_id) ON DELETE CASCADE,
        dosage VARCHAR(${PRESCRIPTION_CONFIG.PRESCRIPTION_DOSAGE_MAX_LENGTH}) NOT NULL,
        instruction TEXT NOT NULL,
        prescription_date DATE DEFAULT NULL,
        current BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (appointment_id, medicine_id, dosage, prescription_date)
    );

    DROP VIEW IF EXISTS prescription_view;

    CREATE VIEW prescription_view AS
    SELECT
        p.prescription_id,
        p.appointment_id,
        p.medicine_id,
        m.name,
        p.dosage,
        p.instruction,
        p.prescription_date,
        p.current,
        p.created_at,
        p.updated_at,
        a.patient_id,
        a.doctor_id,
        a.hospital_id
    FROM prescription p
    JOIN medicine m ON p.medicine_id = m.medicine_id
    JOIN appointment a ON p.appointment_id = a.appointment_id;

    DROP TRIGGER IF EXISTS trg_update_prescription_updated_at ON prescription;

    CREATE TRIGGER trg_update_prescription_updated_at
    BEFORE UPDATE ON prescription
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { prescriptionTableQuery };