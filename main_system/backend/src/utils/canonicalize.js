const canonicalize = require("canonicalize");

const asArray = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value.rows)) {
        return value.rows;
    }

    return [];
};

/**
 * Convert patient object to canonical JSON string.
 * @param {Object} patientData - The patient data (from DB).
 * @returns {String} canonical JSON string
 */
function canonicalizePatient(patientData) {
  const importantData = {
    patient_id: patientData.patient_id ?? patientData.id,
    name: patientData.name,
    dob: patientData.dob,
    gender: patientData.gender,
    contact: patientData.contact,
    national_id: patientData.national_id,
    insurance_no: patientData.insurance_no,
    address: patientData.address,
    created_at: patientData.created_at,
    updated_at: patientData.updated_at,
  };
  return canonicalize(importantData);
}

/**
 * Canonicalizes patient data for consistent hashing
 * Ensures the same data always produces the same hash
 * @param {Object} patientData - Complete patient EHR data
 * @returns {string} Canonical JSON string
 */
function canonicalizePatientData(patientData) {
    // Create a clean copy with only relevant fields (no IDs for display purposes)
    const cleanData = {
        patient: patientData.patient ? {
            blood_group: patientData.patient.blood_group || null,
            smoking: patientData.patient.smoking || null,
            alcohol: patientData.patient.alcohol || null,
            drug_use: patientData.patient.drug_use || null,
            emergency_contact_country_code: patientData.patient.emergency_contact_country_code || null,
            emergency_contact_number: patientData.patient.emergency_contact_number || null
        } : null,

        allergies: asArray(patientData.allergies).map(allergy => ({
            allergy_name: allergy.allergy_name || null
        })),

        medicalHistory: asArray(patientData.medicalHistory).map(history => ({
            condition_name: history.condition_name || null,
            diagnosis_date: history.diagnosis_date || null
        })),

        familyHistory: asArray(patientData.familyHistory).map(history => ({
            condition_name: history.condition_name || null
        })),

        surgicalHistory: asArray(patientData.surgicalHistory).map(surgery => ({
            surgery_name: surgery.surgery_name || null,
            surgery_date: surgery.surgery_date || null
        })),

        currentPrescriptions: asArray(patientData.currentPrescriptions).map(prescription => ({
            medicine_name: prescription.medicine_name || null,
            dosage: prescription.dosage || null,
            instruction: prescription.instruction || null,
            prescription_date: prescription.prescription_date || null,
            current: prescription.current || false
        })),

        verifiedDocuments: asArray(patientData.verifiedDocuments).map(doc => ({
            original_name: doc.original_name || null,
            document_type: doc.document_type || null,
            ipfs_hash: doc.ipfs_hash || null,
            created_at: doc.created_at || null
        })),

        unverifiedDocuments: asArray(patientData.unverifiedDocuments).map(doc => ({
            original_name: doc.original_name || null,
            document_type: doc.document_type || null,
            ipfs_hash: doc.ipfs_hash || null,
            created_at: doc.created_at || null
        })),

        appointmentHistory: asArray(patientData.appointmentHistory).map(appointment => ({
            date: appointment.date || null,
            time: appointment.time || null,
            reason: appointment.reason || null,
            status: appointment.status || null,
            history_of_present_illness: appointment.history_of_present_illness || null,
            review_of_systems: appointment.review_of_systems || null,
            physical_exam:appointment.physical_exam || null,
            diagnosis: appointment.diagnosis || null,
            plan: appointment.plan || null
        }))
    };

    // Use canonicalize library to ensure consistent JSON formatting
    const canonicalJSON = canonicalize(cleanData);

    console.log('[Canonicalize] Data canonicalized successfully');
    console.log('[Canonicalize] Length:', canonicalJSON.length, 'bytes');

    return canonicalJSON;
}

module.exports = { canonicalizePatient, canonicalizePatientData };