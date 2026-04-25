const hospitalPanelListTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital_panel_list (
        hospital_panel_list_id SERIAL PRIMARY KEY,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        insurance_company_id INTEGER REFERENCES insurance_company(insurance_company_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (hospital_id, insurance_company_id)
    );

    DROP VIEW IF EXISTS hospital_panel_list_view;

    CREATE VIEW hospital_panel_list_view AS
    SELECT 
        hpl.hospital_panel_list_id,
        hpl.hospital_id,
        hpl.insurance_company_id,
        h.name AS hospital_name,
        ic.name AS insurance_company_name,
        ic.focal_person_name,
        ic.focal_person_email,
        ic.focal_person_phone,
        ic.address
    FROM hospital_panel_list hpl
    JOIN hospital h ON h.hospital_id = hpl.hospital_id
    JOIN insurance_company ic ON ic.insurance_company_id = hpl.insurance_company_id;

    CREATE INDEX IF NOT EXISTS idx_hospital_panel_list_hospital_id ON hospital_panel_list(hospital_id);
    CREATE INDEX IF NOT EXISTS idx_hospital_panel_list_insurance_company_id ON hospital_panel_list(insurance_company_id);
`;

module.exports = { hospitalPanelListTableQuery };