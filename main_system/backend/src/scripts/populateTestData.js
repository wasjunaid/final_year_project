const { pool } = require('../config/databaseConfig');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Populates the database with test data for EHR testing
 * Password for all accounts: Test@123
 */
async function populateTestData() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('🚀 Starting database population...\n');

        // Hash password once for all users
        const passwordHash = await bcrypt.hash('Test@123', 10);
        console.log('✅ Password hashed: Test@123\n');

        // ==================== ADDRESSES ====================
        console.log('📍 Creating addresses...');
        const addresses = [
            { street: 'House 123, Street 5, F-7', city: 'Islamabad', state: 'Islamabad Capital Territory', zip: '44000', country: 'Pakistan' },
            { street: 'Flat 45, Block A, Gulberg', city: 'Lahore', state: 'Punjab', zip: '54000', country: 'Pakistan' },
            { street: 'Plot 67, Sector 15, Korangi', city: 'Karachi', state: 'Sindh', zip: '74900', country: 'Pakistan' },
            { street: 'House 89, Street 12, Bahria Town', city: 'Rawalpindi', state: 'Punjab', zip: '46000', country: 'Pakistan' },
            { street: 'Apartment 201, DHA Phase 5', city: 'Karachi', state: 'Sindh', zip: '75500', country: 'Pakistan' },
            { street: 'House 56, Model Town', city: 'Lahore', state: 'Punjab', zip: '54700', country: 'Pakistan' },
            { street: 'Villa 12, Clifton Block 2', city: 'Karachi', state: 'Sindh', zip: '75600', country: 'Pakistan' },
            { street: 'House 34, G-10/4', city: 'Islamabad', state: 'Islamabad Capital Territory', zip: '44000', country: 'Pakistan' }
        ];

        const addressIds = [];
        for (const addr of addresses) {
            const result = await client.query(
                `INSERT INTO address (address) 
                VALUES ($1) RETURNING address_id`,
                [`${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`]
            );
            addressIds.push(result.rows[0].address_id);
        }
        console.log(`✅ Created ${addressIds.length} addresses\n`);

        // ==================== CONTACTS ====================
        console.log('📞 Creating contacts...');
        const contacts = [
            // Patient contacts
            { country_code: '+92', number: '3001234567' },
            { country_code: '+92', number: '3111234567' },
            { country_code: '+92', number: '3211234567' },
            // Emergency contacts
            { country_code: '+92', number: '3331234567' },
            { country_code: '+92', number: '3451234567' },
            { country_code: '+92', number: '3551234567' },
            // Doctor contacts
            { country_code: '+92', number: '3001234568' },
            { country_code: '+92', number: '3111234568' },
            { country_code: '+92', number: '3211234568' },
            // Hospital staff contacts
            { country_code: '+92', number: '3001234569' },
            { country_code: '+92', number: '3111234569' }
        ];

        const contactIds = [];
        for (const contact of contacts) {
            const result = await client.query(
                `INSERT INTO contact (country_code, number) VALUES ($1, $2) RETURNING contact_id`,
                [contact.country_code, contact.number]
            );
            contactIds.push(result.rows[0].contact_id);
        }
        console.log(`✅ Created ${contactIds.length} contacts\n`);

        // ==================== PERSONS (PATIENTS) ====================
        console.log('👤 Creating patient accounts...');
        const patients = [
            {
                email: 'ahmed.khan@example.com',
                first_name: 'Ahmed',
                last_name: 'Khan',
                cnic: '4210112345671',
                dob: '1990-05-15',
                gender: 'M',
                address_idx: 0,
                contact_idx: 0,
                emergency_contact_idx: 3,
                blood_group: 'B+',
                smoking: 'never',
                alcohol: 'never',
                drug_use: 'never'
            },
            {
                email: 'fatima.malik@example.com',
                first_name: 'Fatima',
                last_name: 'Malik',
                cnic: '4210212345672',
                dob: '1985-08-22',
                gender: 'F',
                address_idx: 1,
                contact_idx: 1,
                emergency_contact_idx: 4,
                blood_group: 'A+',
                smoking: 'never',
                alcohol: 'never',
                drug_use: 'never'
            },
            {
                email: 'ali.raza@example.com',
                first_name: 'Ali',
                last_name: 'Raza',
                cnic: '4210312345673',
                dob: '1995-03-10',
                gender: 'M',
                address_idx: 2,
                contact_idx: 2,
                emergency_contact_idx: 5,
                blood_group: 'O+',
                smoking: 'former',
                alcohol: 'former',
                drug_use: 'never'
            }
        ];

        const patientIds = [];
        const patientPersonIds = [];
        for (const patient of patients) {
            const personResult = await client.query(
                `INSERT INTO person (email, password_hash, first_name, last_name, cnic, date_of_birth, gender, address_id, contact_id, is_verified, is_profile_complete)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true) RETURNING person_id`,
                [
                    patient.email,
                    passwordHash,
                    patient.first_name,
                    patient.last_name,
                    patient.cnic,
                    patient.dob,
                    patient.gender,
                    addressIds[patient.address_idx],
                    contactIds[patient.contact_idx]
                ]
            );
            const personId = personResult.rows[0].person_id;
            patientPersonIds.push(personId);

            await client.query(
                `INSERT INTO patient (patient_id, emergency_contact_id, blood_group, smoking, alcohol, drug_use, is_profile_complete)
                VALUES ($1, $2, $3, $4, $5, $6, true)`,
                [personId, contactIds[patient.emergency_contact_idx], patient.blood_group, patient.smoking, patient.alcohol, patient.drug_use]
            );
            patientIds.push(personId);
        }
        console.log(`✅ Created ${patientIds.length} patients\n`);

        // ==================== PERSONS (DOCTORS) ====================
        console.log('👨‍⚕️ Creating doctor accounts...');
        const doctors = [
            {
                email: 'dr.hassan@example.com',
                first_name: 'Dr. Hassan',
                last_name: 'Ali',
                cnic: '4210412345674',
                dob: '1980-07-12',
                gender: 'M',
                license: 'PMC-12345',
                specialization: 'Cardiology',
                experience: 15,
                sitting_start: '09:00',
                sitting_end: '17:00',
                address_idx: 3,
                contact_idx: 6
            },
            {
                email: 'dr.ayesha@example.com',
                first_name: 'Dr. Ayesha',
                last_name: 'Siddiqui',
                cnic: '4210512345675',
                dob: '1983-11-25',
                gender: 'F',
                license: 'PMC-12346',
                specialization: 'General Physician',
                experience: 12,
                sitting_start: '10:00',
                sitting_end: '18:00',
                address_idx: 4,
                contact_idx: 7
            },
            {
                email: 'dr.zain@example.com',
                first_name: 'Dr. Zain',
                last_name: 'Ahmed',
                cnic: '4210612345676',
                dob: '1988-02-18',
                gender: 'M',
                license: 'PMC-12347',
                specialization: 'Pediatrics',
                experience: 8,
                sitting_start: '08:00',
                sitting_end: '16:00',
                address_idx: 5,
                contact_idx: 8
            }
        ];

        const doctorIds = [];
        const doctorPersonIds = [];
        for (const doctor of doctors) {
            const personResult = await client.query(
                `INSERT INTO person (email, password_hash, first_name, last_name, cnic, date_of_birth, gender, address_id, contact_id, is_verified, is_profile_complete)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true) RETURNING person_id`,
                [
                    doctor.email,
                    passwordHash,
                    doctor.first_name,
                    doctor.last_name,
                    doctor.cnic,
                    doctor.dob,
                    doctor.gender,
                    addressIds[doctor.address_idx],
                    contactIds[doctor.contact_idx]
                ]
            );
            const personId = personResult.rows[0].person_id;
            doctorPersonIds.push(personId);

            await client.query(
                `INSERT INTO doctor (doctor_id, license_number, specialization, years_of_experience, sitting_start, sitting_end, status, hospital_id, is_profile_complete)
                VALUES ($1, $2, $3, $4, $5, $6, 'active', NULL, true)`,
                [
                    personId,
                    doctor.license,
                    doctor.specialization,
                    doctor.experience,
                    doctor.sitting_start,
                    doctor.sitting_end
                ]
            );
            doctorIds.push(personId);
        }
        console.log(`✅ Created ${doctorIds.length} doctors\n`);

        // ==================== HOSPITALS ====================
        console.log('🏥 Creating hospitals...');
        const hospitals = [
            'Shifa International Hospital',
            'Aga Khan University Hospital',
            'Liaquat National Hospital'
        ];

        const hospitalIds = [];
        for (const name of hospitals) {
            const result = await client.query(
                `INSERT INTO hospital (name) VALUES ($1) RETURNING hospital_id`,
                [name]
            );
            hospitalIds.push(result.rows[0].hospital_id);
        }
        console.log(`✅ Created ${hospitalIds.length} hospitals\n`);

        // ==================== UPDATE DOCTORS WITH HOSPITALS ====================
        console.log('🔗 Assigning doctors to hospitals...');
        await client.query(
            `UPDATE doctor SET hospital_id = $1 WHERE doctor_id = $2`,
            [hospitalIds[0], doctorIds[0]]
        );
        await client.query(
            `UPDATE doctor SET hospital_id = $1 WHERE doctor_id = $2`,
            [hospitalIds[1], doctorIds[1]]
        );
        await client.query(
            `UPDATE doctor SET hospital_id = $1 WHERE doctor_id = $2`,
            [hospitalIds[2], doctorIds[2]]
        );
        console.log('✅ Doctors assigned to hospitals\n');

        // ==================== HOSPITAL STAFF ====================
        console.log('👔 Creating hospital staff...');
        const hospitalStaff = [
            {
                email: 'admin.shifa@example.com',
                first_name: 'Usman',
                last_name: 'Tariq',
                cnic: '4210712345677',
                dob: '1982-09-15',
                gender: 'M',
                role: 'hospital admin',
                hospital_id: hospitalIds[0],
                address_idx: 6,
                contact_idx: 9
            },
            {
                email: 'tech.shifa@example.com',
                first_name: 'Sana',
                last_name: 'Iqbal',
                cnic: '4210812345678',
                dob: '1992-04-20',
                gender: 'F',
                role: 'hospital lab technician',
                hospital_id: hospitalIds[0],
                address_idx: 7,
                contact_idx: 10
            }
        ];

        const hospitalStaffIds = [];
        for (const staff of hospitalStaff) {
            const personResult = await client.query(
                `INSERT INTO person (email, password_hash, first_name, last_name, cnic, date_of_birth, gender, address_id, contact_id, is_verified, is_profile_complete)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true) RETURNING person_id`,
                [
                    staff.email,
                    passwordHash,
                    staff.first_name,
                    staff.last_name,
                    staff.cnic,
                    staff.dob,
                    staff.gender,
                    addressIds[staff.address_idx],
                    contactIds[staff.contact_idx]
                ]
            );
            const personId = personResult.rows[0].person_id;

            await client.query(
                `INSERT INTO hospital_staff (hospital_staff_id, hospital_id, role) VALUES ($1, $2, $3)`,
                [personId, staff.hospital_id, staff.role]
            );
            hospitalStaffIds.push(personId);
        }
        console.log(`✅ Created ${hospitalStaffIds.length} hospital staff\n`);

        // ==================== PATIENT MEDICAL DATA ====================
        console.log('💊 Creating patient medical data...');

        // Allergies
        const allergies = [
            { patient_id: patientIds[0], allergy: 'Penicillin' },
            { patient_id: patientIds[0], allergy: 'Peanuts' },
            { patient_id: patientIds[1], allergy: 'Dust' },
            { patient_id: patientIds[2], allergy: 'Latex' }
        ];

        for (const allergy of allergies) {
            await client.query(
                `INSERT INTO patient_allergy (patient_id, allergy_name) VALUES ($1, $2)`,
                [allergy.patient_id, allergy.allergy]
            );
        }

        // Medical History
        const medicalHistory = [
            { patient_id: patientIds[0], condition: 'Hypertension', date: '2018-05-10' },
            { patient_id: patientIds[1], condition: 'Diabetes Type 2', date: '2015-03-22' },
            { patient_id: patientIds[2], condition: 'Asthma', date: '2010-07-15' }
        ];

        for (const history of medicalHistory) {
            await client.query(
                `INSERT INTO patient_medical_history (patient_id, condition_name, diagnosis_date) VALUES ($1, $2, $3)`,
                [history.patient_id, history.condition, history.date]
            );
        }

        // Family History
        const familyHistory = [
            { patient_id: patientIds[0], condition: 'Heart Disease' },
            { patient_id: patientIds[1], condition: 'Diabetes' },
            { patient_id: patientIds[2], condition: 'Cancer' }
        ];

        for (const family of familyHistory) {
            await client.query(
                `INSERT INTO patient_family_history (patient_id, condition_name) VALUES ($1, $2)`,
                [family.patient_id, family.condition]
            );
        }

        // Surgical History
        const surgicalHistory = [
            { patient_id: patientIds[0], surgery: 'Appendectomy', date: '2012-08-20' },
            { patient_id: patientIds[1], surgery: 'Cholecystectomy', date: '2019-11-15' }
        ];

        for (const surgery of surgicalHistory) {
            await client.query(
                `INSERT INTO patient_surgical_history (patient_id, surgery_name, surgery_date) VALUES ($1, $2, $3)`,
                [surgery.patient_id, surgery.surgery, surgery.date]
            );
        }

        console.log('✅ Patient medical data created\n');

        // ==================== INSURANCE COMPANIES ====================
        console.log('🏛️ Creating insurance companies...');
        const insuranceCompanies = [
            'State Life Insurance',
            'EFU Life Assurance',
            'Adamjee Insurance'
        ];

        const insuranceCompanyIds = [];
        for (const name of insuranceCompanies) {
            const result = await client.query(
                `INSERT INTO insurance_company (name) VALUES ($1) RETURNING insurance_company_id`,
                [name]
            );
            insuranceCompanyIds.push(result.rows[0].insurance_company_id);
        }
        console.log(`✅ Created ${insuranceCompanyIds.length} insurance companies\n`);

        // ==================== PATIENT INSURANCE ====================
        console.log('📋 Creating patient insurance records...');
        await client.query(
            `INSERT INTO patient_insurance (
                patient_id, insurance_company_id, insurance_number, 
                policy_holder_name, relationship_to_holder, is_primary, is_verified,
                effective_date, expiration_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                patientIds[0],
                insuranceCompanyIds[0],
                'INS123456789',
                'Ahmed Khan',
                'self',
                true,
                true,
                '2024-01-01',
                '2025-12-31'
            ]
        );

        await client.query(
            `INSERT INTO patient_insurance (
                patient_id, insurance_company_id, insurance_number, 
                policy_holder_name, relationship_to_holder, is_primary, is_verified,
                effective_date, expiration_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                patientIds[1],
                insuranceCompanyIds[1],
                'INS987654321',
                'Muhammad Malik',
                'spouse',
                true,
                true,
                '2023-06-01',
                '2025-05-31'
            ]
        );
        console.log('✅ Patient insurance records created\n');

        // ==================== HOSPITAL PANEL LIST ====================
        console.log('🔗 Creating hospital panel lists...');
        await client.query(
            `INSERT INTO hospital_panel_list (hospital_id, insurance_company_id) VALUES ($1, $2)`,
            [hospitalIds[0], insuranceCompanyIds[0]]
        );
        await client.query(
            `INSERT INTO hospital_panel_list (hospital_id, insurance_company_id) VALUES ($1, $2)`,
            [hospitalIds[0], insuranceCompanyIds[1]]
        );
        await client.query(
            `INSERT INTO hospital_panel_list (hospital_id, insurance_company_id) VALUES ($1, $2)`,
            [hospitalIds[1], insuranceCompanyIds[0]]
        );
        console.log('✅ Hospital panel lists created\n');

// ==================== APPOINTMENTS ====================
console.log('📅 Creating appointments...');

// Helper function to get dates
const today = new Date();
const futureDate1 = new Date(today);
futureDate1.setDate(futureDate1.getDate() + 6); // 6 days from today (meets 5+ day requirement)

const futureDate2 = new Date(today);
futureDate2.setDate(futureDate2.getDate() + 7); // 7 days from today

const futureDate3 = new Date(today);
futureDate3.setDate(futureDate3.getDate() + 10); // 10 days from today

// Format date as YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

// Completed appointment 1 - Use future date, but set it as completed with timestamps
const completedAppointment = await client.query(
    `INSERT INTO appointment (
        patient_id, doctor_id, hospital_id, date, time, reason, status, 
        appointment_cost, started_at, completed_at, 
        history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan,
        lab_tests_ordered, lab_tests_completed
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
    RETURNING appointment_id`,
    [
        patientIds[0],
        doctorIds[0],
        hospitalIds[0],
        formatDate(futureDate1), // Future date (meets constraint)
        '10:00',
        'Chest pain and shortness of breath',
        'completed', // Status is completed
        3000,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Started 7 days ago
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // Completed 45 mins after start
        'Patient reports intermittent chest pain for 2 weeks',
        'Cardiovascular: Chest pain, no palpitations. Respiratory: Shortness of breath on exertion',
        'BP: 140/90, HR: 88, Normal heart sounds, Clear lungs',
        'Essential Hypertension, Suspected Angina',
        'Start Amlodipine 5mg daily, ECG ordered, Follow up in 2 weeks',
        false, // lab_tests_ordered
        false  // lab_tests_completed
    ]
);
const appointmentId1 = completedAppointment.rows[0].appointment_id;

// Another completed appointment for patient 2
const completedAppointment2 = await client.query(
    `INSERT INTO appointment (
        patient_id, doctor_id, hospital_id, date, time, reason, status, 
        appointment_cost, started_at, completed_at, 
        history_of_present_illness, review_of_systems, physical_exam, diagnosis, plan,
        lab_tests_ordered, lab_tests_completed
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
    RETURNING appointment_id`,
    [
        patientIds[1],
        doctorIds[1],
        hospitalIds[1],
        formatDate(futureDate2), // Future date (meets constraint)
        '14:00',
        'Diabetes follow-up',
        'completed',
        2500,
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Started 5 days ago
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Completed 30 mins after start
        'Regular diabetes checkup, patient on Metformin',
        'Endocrine: No polyuria, polydipsia controlled',
        'BP: 130/85, Weight: 75kg, BMI: 27',
        'Type 2 Diabetes Mellitus - Controlled',
        'Continue Metformin 500mg BD, HbA1c test ordered',
        false,
        false
    ]
);
const appointmentId2 = completedAppointment2.rows[0].appointment_id;

// Scheduled upcoming appointment (for testing appointment flow)
const scheduledAppointment = await client.query(
    `INSERT INTO appointment (
        patient_id, doctor_id, hospital_id, date, time, reason, status, appointment_cost
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING appointment_id`,
    [
        patientIds[2],
        doctorIds[2],
        hospitalIds[2],
        formatDate(futureDate3), // Future date
        '14:00',
        'Routine pediatric checkup',
        'upcoming',
        2000
    ]
);

console.log(`✅ Created 3 appointments\n`);

        // ==================== MEDICINES & PRESCRIPTIONS ====================
        console.log('💊 Creating medicines and prescriptions...');
        
        const medicines = [
            { name: 'Amlodipine' },
            { name: 'Metformin' },
            { name: 'Panadol'},
            { name: 'Aspirin' }
        ];

        const medicineIds = [];
        for (const med of medicines) {
            const result = await client.query(
                `INSERT INTO medicine (name) VALUES ($1) RETURNING medicine_id`,
                [med.name]
            );
            medicineIds.push(result.rows[0].medicine_id);
        }

        // Prescription for appointment 1
        await client.query(
            `INSERT INTO prescription (
                appointment_id, medicine_id, dosage, instruction, prescription_date, current
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                appointmentId1,
                medicineIds[0],
                '5mg',
                'Take one tablet daily in the morning',
                '2024-01-15',
                true
            ]
        );

        await client.query(
            `INSERT INTO prescription (
                appointment_id, medicine_id, dosage, instruction, prescription_date, current
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                appointmentId1,
                medicineIds[3],
                '75mg',
                'Take one tablet daily after breakfast',
                '2024-01-15',
                true
            ]
        );

        // Prescription for appointment 2
        await client.query(
            `INSERT INTO prescription (
                appointment_id, medicine_id, dosage, instruction, prescription_date, current
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                appointmentId2,
                medicineIds[1],
                '500mg',
                'Take one tablet twice daily with meals',
                '2024-01-20',
                true
            ]
        );

        console.log(`✅ Created medicines and prescriptions\n`);

        // ==================== LAB TESTS ====================
        console.log('🔬 Creating lab tests...');
        
        const labTests = [
            { hospital_id: hospitalIds[0], name: 'Complete Blood Count (CBC)', description: 'Full blood panel test', cost: 1500 },
            { hospital_id: hospitalIds[0], name: 'Lipid Profile', description: 'Cholesterol and triglycerides', cost: 2000 },
            { hospital_id: hospitalIds[0], name: 'ECG', description: 'Electrocardiogram', cost: 2500 },
            { hospital_id: hospitalIds[1], name: 'HbA1c', description: 'Diabetes monitoring', cost: 1800 },
            { hospital_id: hospitalIds[1], name: 'Liver Function Test', description: 'LFT panel', cost: 2200 }
        ];

        const labTestIds = [];
        for (const test of labTests) {
            const result = await client.query(
                `INSERT INTO lab_test (hospital_id, name, description, cost) VALUES ($1, $2, $3, $4) RETURNING lab_test_id`,
                [test.hospital_id, test.name, test.description, test.cost]
            );
            labTestIds.push(result.rows[0].lab_test_id);
        }

        console.log(`✅ Created ${labTestIds.length} lab tests\n`);

        // ==================== MEDICAL CODING ====================
        console.log('📊 Creating medical coding data...');
        
        // ICD codes
        const icdCodes = [
            { code: 'I10', description: 'Essential (primary) hypertension' },
            { code: 'I20.9', description: 'Angina pectoris, unspecified' },
            { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
            { code: 'J45.9', description: 'Asthma, unspecified' }
        ];

        for (const icd of icdCodes) {
            await client.query(
                `INSERT INTO icd (icd_code, description) VALUES ($1, $2)`,
                [icd.code, icd.description]
            );
        }

        // CPT codes
        const cptCodes = [
            { code: '99213', description: 'Office visit, established patient' },
            { code: '93000', description: 'Electrocardiogram, routine ECG' },
            { code: '80053', description: 'Comprehensive metabolic panel' },
            { code: '83036', description: 'Hemoglobin A1c test' }
        ];

        for (const cpt of cptCodes) {
            await client.query(
                `INSERT INTO cpt (cpt_code, description) VALUES ($1, $2)`,
                [cpt.code, cpt.description]
            );
        }

        // Link ICD codes to appointments
        await client.query(
            `INSERT INTO appointment_icd (appointment_id, icd_code) VALUES ($1, $2)`,
            [appointmentId1, 'I10']
        );
        await client.query(
            `INSERT INTO appointment_icd (appointment_id, icd_code) VALUES ($1, $2)`,
            [appointmentId1, 'I20.9']
        );
        await client.query(
            `INSERT INTO appointment_icd (appointment_id, icd_code) VALUES ($1, $2)`,
            [appointmentId2, 'E11.9']
        );

        // Link CPT codes to appointments
        await client.query(
            `INSERT INTO appointment_cpt (appointment_id, cpt_code) VALUES ($1, $2)`,
            [appointmentId1, '99213']
        );
        await client.query(
            `INSERT INTO appointment_cpt (appointment_id, cpt_code) VALUES ($1, $2)`,
            [appointmentId1, '93000']
        );
        await client.query(
            `INSERT INTO appointment_cpt (appointment_id, cpt_code) VALUES ($1, $2)`,
            [appointmentId2, '99213']
        );
        await client.query(
            `INSERT INTO appointment_cpt (appointment_id, cpt_code) VALUES ($1, $2)`,
            [appointmentId2, '83036']
        );

        console.log('✅ Medical coding data created\n');

        // ==================== BILLS & CLAIMS ====================
        console.log('💰 Creating bills and claims...');
        
        // Bill for appointment 1
        const bill1 = await client.query(
            `INSERT INTO bill (appointment_id, amount) VALUES ($1, $2) RETURNING bill_id`,
            [appointmentId1, 3000]
        );

        // Claim for bill 1
        await client.query(
            `INSERT INTO claim (bill_id, appointment_id, status) VALUES ($1, $2, $3)`,
            [bill1.rows[0].bill_id, appointmentId1, 'pending']
        );

        // Bill for appointment 2
        const bill2 = await client.query(
            `INSERT INTO bill (appointment_id, amount) VALUES ($1, $2) RETURNING bill_id`,
            [appointmentId2, 2500]
        );

        // Claim for bill 2
        await client.query(
            `INSERT INTO claim (bill_id, appointment_id, status) VALUES ($1, $2, $3)`,
            [bill2.rows[0].bill_id, appointmentId2, 'approved']
        );

        console.log('✅ Bills and claims created\n');

        // ==================== EHR ACCESS REQUESTS ====================
        console.log('🔐 Creating EHR access records...');
        
        // Doctor 1 requests access to Patient 1 (pending)
        await client.query(
            `INSERT INTO ehr_access (patient_id, doctor_id, status) VALUES ($1, $2, $3)`,
            [patientIds[0], doctorIds[0], 'requested']
        );

        // Doctor 2 has granted access to Patient 2
        await client.query(
            `INSERT INTO ehr_access (patient_id, doctor_id, status) VALUES ($1, $2, $3)`,
            [patientIds[1], doctorIds[1], 'granted']
        );

        // Doctor 3 denied access to Patient 3
        await client.query(
            `INSERT INTO ehr_access (patient_id, doctor_id, status) VALUES ($1, $2, $3)`,
            [patientIds[2], doctorIds[2], 'denied']
        );

        console.log('✅ EHR access records created\n');

  // ==================== NOTIFICATIONS ====================
console.log('🔔 Creating notifications...');

// Notification for patient about EHR access request
await client.query(
    `INSERT INTO notification (person_id, role, title, message, type, is_read, related_id, related_table) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
        patientIds[0],
        'patient',  // ADDED: role of the recipient
        'EHR Access Request',
        'Dr. Hassan Ali has requested access to your EHR',
        'medical',  // ADDED: notification type
        false,
        doctorIds[0],  // ADDED: related doctor ID
        'ehr_access'   // ADDED: related table
    ]
);

// Notification for doctor about EHR access granted
await client.query(
    `INSERT INTO notification (person_id, role, title, message, type, is_read, related_id, related_table) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
        doctorIds[1],
        'doctor',  // ADDED: role of the recipient
        'EHR Access Granted',
        'Fatima Malik has granted you access to their EHR',
        'medical',  // ADDED: notification type
        true,
        patientIds[1],  // ADDED: related patient ID
        'ehr_access'   // ADDED: related table
    ]
);

// Additional notification for appointment reminder
await client.query(
    `INSERT INTO notification (person_id, role, title, message, type, is_read, related_id, related_table) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
        patientIds[2],
        'patient',
        'Upcoming Appointment',
        'You have an appointment with Dr. Zain Ahmed on ' + formatDate(futureDate3),
        'medical',
        false,
        scheduledAppointment.rows[0].appointment_id,
        'appointment'
    ]
);

console.log('✅ Notifications created\n');

        // ==================== LOGS ====================
        console.log('📝 Creating log entries...');
        
        await client.query(
            `INSERT INTO log (person_id, action) VALUES ($1, $2)`,
            [patientIds[0], 'Patient profile created']
        );

        await client.query(
            `INSERT INTO log (person_id, action) VALUES ($1, $2)`,
            [doctorIds[0], 'Doctor profile created']
        );

        await client.query(
            `INSERT INTO log (person_id, action) VALUES ($1, $2)`,
            [patientIds[0], 'EHR access request received from Dr. Hassan Ali']
        );

        console.log('✅ Log entries created\n');

        // ==================== COMMIT TRANSACTION ====================
        await client.query('COMMIT');

        console.log('\n🎉 ========================================');
        console.log('🎉 DATABASE POPULATION COMPLETED!');
        console.log('🎉 ========================================\n');

        console.log('📋 Test Accounts Summary:');
        console.log('┌─────────────────────────────────────────────────────────┐');
        console.log('│ PATIENTS                                                │');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ Email: ahmed.khan@example.com      | Password: Test@123│');
        console.log('│ Email: fatima.malik@example.com    | Password: Test@123│');
        console.log('│ Email: ali.raza@example.com        | Password: Test@123│');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ DOCTORS                                                 │');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ Email: dr.hassan@example.com       | Password: Test@123│');
        console.log('│ Email: dr.ayesha@example.com       | Password: Test@123│');
        console.log('│ Email: dr.zain@example.com         | Password: Test@123│');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ HOSPITAL STAFF                                          │');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ Email: admin.shifa@example.com     | Password: Test@123│');
        console.log('│ Email: tech.shifa@example.com      | Password: Test@123│');
        console.log('└─────────────────────────────────────────────────────────┘\n');

        console.log('🔗 Database IDs for Testing:');
        console.log(`   Patient IDs: ${patientIds.join(', ')}`);
        console.log(`   Doctor IDs: ${doctorIds.join(', ')}`);
        console.log(`   Hospital IDs: ${hospitalIds.join(', ')}`);
        console.log(`   Appointment IDs: ${appointmentId1}, ${appointmentId2}\n`);

        console.log('📝 Testing Flow for EHR Access:');
        console.log('   1. Login as doctor (dr.hassan@example.com)');
        console.log('   2. Request EHR access for patient (ahmed.khan@example.com)');
        console.log('   3. Login as patient (ahmed.khan@example.com)');
        console.log('   4. Grant/Deny access to doctor');
        console.log('   5. Login as doctor again');
        console.log('   6. Retrieve patient EHR data with blockchain verification\n');

        console.log('📝 EHR Access Status:');
        console.log('   - ahmed.khan ↔ dr.hassan: REQUESTED (pending)');
        console.log('   - fatima.malik ↔ dr.ayesha: GRANTED (can access)');
        console.log('   - ali.raza ↔ dr.zain: DENIED (rejected)\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error populating database:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the script
if (require.main === module) {
    populateTestData()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { populateTestData };