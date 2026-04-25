const {
    APPOINTMENT_CONFIG,
    VALID_APPOINTMENT_STATUSES_OBJECT,
    VALID_APPOINTMENT_STATUSES
} = require("../../validations/appointment/appointmentValidations");

const appointmentTableQuery = `
    CREATE TABLE IF NOT EXISTS appointment (
        appointment_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patient(patient_id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctor(doctor_id) ON DELETE CASCADE,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time TIME NOT NULL,
        reason TEXT NOT NULL,
        appointment_type VARCHAR(20) DEFAULT 'opd' CHECK (appointment_type IN ('opd', 'hospitalization')),
        parent_appointment_id INTEGER REFERENCES appointment(appointment_id) ON DELETE SET NULL,
        follow_up_notes TEXT,
        admission_date DATE,
        discharge_date DATE,
        applied_hospitalization_daily_charge NUMERIC(10, 2) DEFAULT NULL CHECK (applied_hospitalization_daily_charge IS NULL OR applied_hospitalization_daily_charge >= 0),
        hospitalization_total_charge NUMERIC(10, 2) DEFAULT NULL CHECK (hospitalization_total_charge IS NULL OR hospitalization_total_charge >= 0),
        status VARCHAR(${APPOINTMENT_CONFIG.APPOINTMENT_STATUS_MAX_LENGTH}) CHECK (status IN (${VALID_APPOINTMENT_STATUSES.map(status => `'${status}'`).join(', ')})) DEFAULT '${VALID_APPOINTMENT_STATUSES_OBJECT.PROCESSING}' NOT NULL,

        appointment_cost NUMERIC(10, 9) NOT NULL DEFAULT 0 CHECK (appointment_cost >= 0),
        
        started_at TIMESTAMP,
        completed_at TIMESTAMP,

        lab_tests_ordered BOOLEAN DEFAULT FALSE,
        lab_tests_completed BOOLEAN DEFAULT FALSE,

        history_of_present_illness TEXT,
        review_of_systems TEXT,
        physical_exam TEXT,
        diagnosis TEXT,
        plan TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(20) DEFAULT 'opd' CHECK (appointment_type IN ('opd', 'hospitalization'));

    ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS parent_appointment_id INTEGER REFERENCES appointment(appointment_id) ON DELETE SET NULL;

    ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;

    ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS admission_date DATE;

    ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS discharge_date DATE;

    ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS applied_hospitalization_daily_charge NUMERIC(10, 2) DEFAULT NULL CHECK (applied_hospitalization_daily_charge IS NULL OR applied_hospitalization_daily_charge >= 0);

    ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS hospitalization_total_charge NUMERIC(10, 2) DEFAULT NULL CHECK (hospitalization_total_charge IS NULL OR hospitalization_total_charge >= 0);

    ALTER TABLE appointment
    DROP CONSTRAINT IF EXISTS appointment_date_check;

    ALTER TABLE appointment
    DROP CONSTRAINT IF EXISTS appointment_schedulable_date_check;

    ALTER TABLE appointment
    ADD CONSTRAINT appointment_date_check
    CHECK (
        status NOT IN ('processing', 'pending', 'upcoming')
        OR date >= CURRENT_DATE + ${APPOINTMENT_CONFIG.APPOINTMENT_DATE_INTERVAL_DAYS}
    );

    DROP VIEW IF EXISTS appointment_view;

    CREATE VIEW appointment_view AS
    SELECT 
        a.appointment_id,
        a.patient_id,
        a.doctor_id,
        a.hospital_id,
        TO_CHAR(a.date, 'YYYY-MM-DD') AS date,
        TO_CHAR(a.time, 'HH24:MI') AS time,
        a.reason,
        a.appointment_type,
        a.parent_appointment_id,
        a.follow_up_notes,
        TO_CHAR(a.admission_date, 'YYYY-MM-DD') AS admission_date,
        TO_CHAR(a.discharge_date, 'YYYY-MM-DD') AS discharge_date,
        a.applied_hospitalization_daily_charge,
        a.hospitalization_total_charge,
        a.status,
        a.appointment_cost,
        a.started_at,
        a.completed_at,
        a.lab_tests_ordered,
        a.lab_tests_completed,
        a.history_of_present_illness,
        a.review_of_systems,
        a.physical_exam,
        a.diagnosis,
        a.plan,
        a.created_at,
        a.updated_at,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        p.email AS patient_email,
        d.first_name AS doctor_first_name,
        d.last_name AS doctor_last_name,
        d.email AS doctor_email,
        h.name AS hospital_name
    FROM appointment a
    JOIN person p ON a.patient_id = p.person_id
    JOIN person d ON a.doctor_id = d.person_id
    JOIN hospital h ON a.hospital_id = h.hospital_id;

    CREATE INDEX IF NOT EXISTS idx_appointment_patient_id ON appointment(patient_id);
    CREATE INDEX IF NOT EXISTS idx_appointment_doctor_id ON appointment(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_appointment_hospital_id ON appointment(hospital_id);
    CREATE INDEX IF NOT EXISTS idx_appointment_date ON appointment(date);
    CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointment(status);
    CREATE INDEX IF NOT EXISTS idx_appointment_parent_appointment_id ON appointment(parent_appointment_id);
    CREATE INDEX IF NOT EXISTS idx_appointment_type ON appointment(appointment_type);

    DROP TRIGGER IF EXISTS trg_update_appointment_updated_at ON appointment;

    CREATE TRIGGER trg_update_appointment_updated_at
    BEFORE UPDATE ON appointment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

module.exports = { appointmentTableQuery };