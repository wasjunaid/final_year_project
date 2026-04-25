const appointmentICDTableQuery = `
    CREATE TABLE IF NOT EXISTS appointment_icd (
        appointment_icd_id SERIAL PRIMARY KEY,
        appointment_id INT NOT NULL,
        icd_code VARCHAR(10) REFERENCES icd(icd_code) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS appointment_icd_view;

    CREATE VIEW appointment_icd_view AS
    SELECT
    aicd.appointment_icd_id,
    aicd.appointment_id,
    aicd.icd_code,
    icd.description
    FROM appointment_icd aicd
    JOIN icd ON aicd.icd_code = icd.icd_code;
`;

module.exports = {appointmentICDTableQuery};