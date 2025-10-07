export interface EHRData {
  personData: {
    person_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    date_of_birth: string;
    gender: string;
    address: string;
  };
  patientData: {
    patient_id: number;
    blood_group: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    medical_history: string;
    allergies: string;
  };
  unverifiedDocuments: Array<{
    document_id: string;
    original_name: string;
    document_type: string;
    detail: string;
    created_at: string;
  }>;
  appointments: Array<{
    appointment_id: number;
    appointment_date: string;
    appointment_time: string;
    status: string;
    notes: string;
    doctor_name: string;
    hospital_name: string;
  }>;
}
