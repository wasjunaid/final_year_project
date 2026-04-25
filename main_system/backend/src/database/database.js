const { pool } = require("../config/databaseConfig");

const { addressTableQuery } = require("./address/addressTableQuery");
const { contactTableQuery } = require("./contact/contactTableQuery");
const { personTableQuery } = require("./person/personTableQuery");
const { tokenTableQuery } = require("./token/tokenTableQuery");
const { patientTableQuery } = require("./patient/patientTableQuery");
const { hospitalTableQuery } = require("./hospital/hospitalTableQuery");
const { doctorTableQuery } = require("./doctor/doctorTableQuery");
const { appointmentTableQuery } = require("./appointment/appointmentTableQuery");
const { notificationTableQuery } = require("./notification/notificationTableQuery");
const { labTestTableQuery } = require("./labTest/labTestTableQuery");
const { documentTableQuery } = require("./document/documentTableQuery");
const { logTableQuery } = require("./log/logTableQuery");
const { EHRAccessTable } = require("./EHR/EHRAccessTableQuery");
const { insuranceCompanyTableQuery } = require("./insurance/insuranceCompanyTableQuery");
const { systemAdminTableQuery } = require("./system/systemAdminTableQuery");
const { hospitalStaffTableQuery } = require("./hospital/hospitalStaffTableQuery");
const { medicineTableQuery } = require("./medicine/medicineTableQuery");
const { prescriptionTableQuery } = require("./prescription/prescriptionTableQuery");
const { hospitalAssociationRequestTableQuery } = require("./hospital/hospitalAssociationRequestTableQuery");
const { patientInsuranceTableQuery } = require("./patient/patientInsuranceTableQuery");
const { hospitalPanelListTableQuery } = require("./hospital/hospitalPanelListTableQuery");
const { medicalCoderTableQuery } = require("./medicalCoder/medicalCoderTableQuery");
const { patientAllergyTableQuery } = require("./patient/patientAllergyTableQuery");
const { patientFamilyHistoryTableQuery } = require("./patient/patientFamilyHistoryTableQuery");
const { patientSurgicalHistoryTableQuery } = require("./patient/patientSurgicalHistoryTableQuery");
const { patientMedicalHistoryTableQuery } = require("./patient/patientMedicalHistoryTableQuery");

const { icdTableQuery } = require("./medicalCoding/icdTableQuery");
const { cptTableQuery } = require("./medicalCoding/cptTableQuery");
const { appointmentICDTableQuery } = require("./medicalCoding/appointmentICDTableQuery");
const { appointmentCPTTableQuery } = require("./medicalCoding/appointmentCPTTableQuery");

const { billTableQuery } = require("./bill/billTableQuery");

const updateFunction = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Only update timestamp if there are actual changes
        IF ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) THEN
            NEW.updated_at = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
`;

const getReadableErrorMessage = (error) => {
    if (!error) {
        return "Unknown database initialization error";
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

    return "Unknown database initialization error";
};

const database = async () => {
    try {

        await pool.query(updateFunction);
        console.log("Update Function Created");

        await pool.query(addressTableQuery);
        console.log("Address Table Initialized");
        await pool.query(contactTableQuery);
        console.log("Contact Table Initialized");

        await pool.query(personTableQuery);
        console.log("Person Table Initialized");

        await pool.query(tokenTableQuery);
        console.log("Token Table Initialized");

        await pool.query(patientTableQuery);
        console.log("Patient Table Initialized");

        await pool.query(hospitalTableQuery);
        console.log("Hospital Table Initialized");

        await pool.query(doctorTableQuery);
        console.log("Doctor Table Initialized");

        await pool.query(appointmentTableQuery);
        console.log("Appointment Table Initialized");

        await pool.query(notificationTableQuery);
        console.log("Notification Table Initialized");

        await pool.query(hospitalStaffTableQuery);
        console.log("Hospital Staff Table Initialized");
        await pool.query(hospitalAssociationRequestTableQuery);
        console.log("Hospital Association Request Table Initialized");

        await pool.query(insuranceCompanyTableQuery);
        console.log("Insurance Company Table Initialized");

        await pool.query(hospitalPanelListTableQuery);
        console.log("Hospital Panel List Table Initialized");

        await pool.query(labTestTableQuery);
        console.log("Lab Test Table Initialized");

        await pool.query(EHRAccessTable);
        console.log("EHR Access Table Initialized");

        await pool.query(logTableQuery);
        console.log("Log Table Initialized");

        await pool.query(systemAdminTableQuery);
        console.log("System Admin Table Initialized");

        await pool.query(medicineTableQuery);
        console.log("Medicine Table Initialized");
        await pool.query(prescriptionTableQuery);
        console.log("Prescription Table Initialized");
        await pool.query(patientInsuranceTableQuery);
        console.log("Patient Insurance Table Initialized");

        await pool.query(documentTableQuery);
        console.log("Document Table Initialized");

        await pool.query(medicalCoderTableQuery);
        console.log("Medical Coder Table Initialized");

        await pool.query(patientAllergyTableQuery);
        console.log("Patient Allergy Table Initialized");

        await pool.query(patientFamilyHistoryTableQuery);
        console.log("Patient Family History Table Initialized");

        await pool.query(patientSurgicalHistoryTableQuery);
        console.log("Patient Surgical History Table Initialized");

        await pool.query(patientMedicalHistoryTableQuery);
        console.log("Patient Medical History Table Initialized");

        await pool.query(icdTableQuery);
        console.log("ICD Table Initialized");
        await pool.query(cptTableQuery);
        console.log("CPT Table Initialized");
        await pool.query(appointmentICDTableQuery);
        console.log("Appointment ICD Table Initialized");
        await pool.query(appointmentCPTTableQuery);
        console.log("Appointment CPT Table Initialized");

        await pool.query(billTableQuery);
        console.log("Bill Table Initialized");

        console.log("Database Initialized Successfully");
    } catch (error) {
        const message = getReadableErrorMessage(error);
        console.log(`Error Initializing Database: ${message}`);
        throw error;
    }
};

module.exports = { database };