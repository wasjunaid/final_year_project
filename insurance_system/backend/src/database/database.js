const { pool } = require("../config/databaseConfig");

const { userTableQuery } = require("./user/userTableQuery");
const { superAdminTableQuery } = require("./system/superAdminTableQuery");
const { personTableQuery } = require("./person/personTableQuery");
const { insuranceCompanyTableQuery } = require("./insurance/insuranceCompanyTableQuery");
const { insuranceStaffTableQuery } = require("./insurance/insuranceStaffTableQuery");
const { hospitalTableQuery } = require("./hospital/hospitalTableQuery");
const { insurancePanelListTableQuery } = require("./insurance/insurancePanelListTableQuery");
const { insurancePlanTableQuery } = require("./insurance/insurancePlanTableQuery");
const { insuranceTableQuery } = require("./insurance/insuranceTableQuery");
const { personInsuranceTableQuery } = require("./person/personInsuranceTableQuery");
const { claimTableQuery } = require("./claim/claimTableQuery");

const getReadableErrorMessage = (error) => {
    if (!error) {
        return "Unknown insurance database initialization error";
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error.message && String(error.message).trim().length > 0) {
        return error.message;
    }

    if (Array.isArray(error.errors) && error.errors.length > 0) {
        return error.errors
            .map((err) => err?.message || String(err))
            .filter(Boolean)
            .join(' | ');
    }

    if (error.code) {
        return `Database error code: ${error.code}`;
    }

    return "Unknown insurance database initialization error";
};

const database = async () => {
    try {
        await pool.query(userTableQuery);
        console.log("User Table Initialized");
        await pool.query(superAdminTableQuery);
        console.log("Super Admin Table Initialized");
        await pool.query(personTableQuery);
        console.log("Person Table Initialized");
        await pool.query(insuranceCompanyTableQuery);
        console.log("Insurance Company Table Initialized");
        await pool.query(insuranceStaffTableQuery);
        console.log("Insurance Staff Table Initialized");
        await pool.query(hospitalTableQuery);
        console.log("Hospital Table Initialized");
        await pool.query(insurancePanelListTableQuery);
        console.log("Insurance Panel List Table Initialized");
        await pool.query(insurancePlanTableQuery);
        console.log("Insurance Plan Table Initialized");
        await pool.query(insuranceTableQuery);
        console.log("Insurance Table Initialized");
        await pool.query(personInsuranceTableQuery);
        console.log("Person Insurance Table Initialized");
        await pool.query(claimTableQuery);
        console.log("Claim Table Initialized");

        await pool.query(`
            DROP VIEW IF EXISTS user_view;

    CREATE VIEW user_view AS
    SELECT
        u.user_id,
        u.email,
        ins.role
    FROM "user" u
    LEFT JOIN insurance_staff ins ON u.user_id = ins.insurance_staff_id;`)

        console.log("Insurance Database Initialized Successfully");
    } catch (error) {
        const message = getReadableErrorMessage(error);
        console.error(`Error Initializing Insurance Database: ${message}`);
        throw error;
    }
}

module.exports = { database };