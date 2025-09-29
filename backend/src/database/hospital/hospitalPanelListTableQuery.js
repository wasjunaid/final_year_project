const hospitalPanelListTableQuery = `
    CREATE TABLE IF NOT EXISTS hospital_panel_list (
        hospital_panel_list_id SERIAL PRIMARY KEY,
        hospital_id INTEGER REFERENCES hospital(hospital_id) ON DELETE CASCADE,
        insurance_company_id INTEGER REFERENCES insurance_company(insurance_company_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (hospital_id, insurance_company_id)
    );
`;

module.exports = { hospitalPanelListTableQuery };