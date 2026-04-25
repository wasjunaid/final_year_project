const insurancePanelListTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance_panel_list (
        insurance_panel_list_id SERIAL PRIMARY KEY,
        insurance_company_id INTEGER REFERENCES insurance_company(insurance_company_id) ON DELETE CASCADE,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        UNIQUE(insurance_company_id, hospital_id)
    );

    DROP VIEW IF EXISTS insurance_panel_list_view;

    CREATE VIEW insurance_panel_list_view AS
    SELECT
        ipl.insurance_panel_list_id,
        ipl.insurance_company_id,
        ipl.hospital_id,
        h.name as hospital_name,
        h.focal_person_name,
        h.focal_person_email,
        h.focal_person_phone,
        h.address
    FROM insurance_panel_list ipl
    JOIN hospital h ON ipl.hospital_id = h.hospital_id;
`;

module.exports = { insurancePanelListTableQuery };