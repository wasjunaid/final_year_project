const appointmentCPTTableQuery = `
    CREATE TABLE IF NOT EXISTS appointment_cpt (
        appointment_cpt_id SERIAL PRIMARY KEY,
        appointment_id INT NOT NULL,
        cpt_code VARCHAR(10) REFERENCES cpt(cpt_code) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DROP VIEW IF EXISTS appointment_cpt_view;

    CREATE VIEW appointment_cpt_view AS
    SELECT
    acpt.appointment_cpt_id,
    acpt.appointment_id,
    acpt.cpt_code,
    cpt.description
    FROM appointment_cpt acpt
    JOIN cpt ON acpt.cpt_code = cpt.cpt_code;
`;

module.exports = {appointmentCPTTableQuery};