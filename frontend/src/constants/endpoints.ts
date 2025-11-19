const EndPoints = {
  auth: {
    signIn: "/auth/sign-in", //POST
    signUp: "/auth/sign-up", //POST
    refreshJWT: "/auth/refresh-jwt", //POST
    sendOrResendEmailVerificationToken: "/token/send-email-verification", //POST
    sendOrResendEmailPasswordResetToken: "/token/send-password-reset", //POST
    verifyEmail: "/token/verify-email", //POST
    passwordReset: "/token/reset-password", //POST
  },
  appointment: {
    getAllPatient: "/appointment/patient", // GETa
    getAllDoctor: "/appointment/doctor", // GET
    getAllHospital: "/appointment/hospital", // GET
    insert: "/appointment", // POST
    approve: "/appointment/approve/:appointment_id", // PUT
    deny: "/appointment/deny/:appointment_id", // PUT
    cancelByPatient: "/appointment/cancel/:appointment_id", // PUT (for patient)
    rescheduleByPatient: "/appointment/patient-reschedule/:appointment_id", // PUT
    rescheduleByHospital: "/appointment/hospital-reschedule/:appointment_id", // PUT
    startByDoctor: "/appointment/start/:appointment_id", // PUT
    setLabTestRequiredByDoctor: "/appointment/require-lab-test/:appointment_id", // PUT
    setLabPrescriptionRequiredByDoctor: "/appointment/require-prescription/:appointment_id", // PUT
    completeByDoctor: "/appointment/complete-doctor/:appointment_id", // PUT
    completeLabTestByLabTechnician: "/appointment/complete-lab-test/:appointment_id", // PUT
    completePrescriptionByLabTechnician: "/appointment/complete-prescription/:appointment_id", // PUT
  },
  doctor: {
    get: "/doctor", // GET
    getDoctorsForAppointmentBooking: "/doctor/appointment-booking", // GET
    update: "/doctor",  // PUT
    updateStatus: "/doctor/status/:doctor_id",  // PUT
    updateHospitalByDoctor: "/doctor/update-hospital",  // PUT
    updateHospitalByHospitalAdmin: "/doctor/remove-hospital/:doctor_id",  // PUT
    getHospitalassociatedDoctors: "/doctor/hospital", // GET
  },
  ehrAccess: {
    requestByDoctor: '/ehr-access/request',
    getForDoctor: '/ehr-access/doctor',
    getForPatient: '/ehr-access/patient',
    grantByPatient: '/ehr-access/grant/:ehr_access_id',
    denyByPatient: '/ehr-access/deny/:ehr_access_id',
    revoke: '/ehr-access/revoke/:ehr_access_id',
  },
  ehr: {
    getPatientEHR: '/ehr/patient/:patient_id', // Get EHR by patient ID for doctor
    getMyEHR: '/ehr/patient', // Get my EHR for patient
    update: '/ehr', // Update EHR
  },
  hospital: {
    get: "/hospital", // GET
    insert: "/hospital", // POST
    update: "/hospital/:hospital_id", // PUT
  },
  hospitalAssociationRequest: {
    getByPerson: "/hospital-association-request/hospital-staff", // GET
    getByHospital: "/hospital-association-request/hospital-staff", // GET TODO: verify this endpoint
    insert: "/hospital-association-request", // POST
    approve: "/hospital-association-request/accept/:hospital_association_request_id", // POST
    deleteByStaff: "/hospital-association-request/hospital-staff/:hospital_association_request_id", // DELETE
    deleteByPerson: "/hospital-association-request/person/:hospital_association_request_id", // DELETE
    deleteAllByPerson: "/hospital-association-request/person", // DELETE
  },
  hospitalPannelList: {
    getAll: "/hospital-panel-list", // GET
    insert: "/hospital-panel-list", // POST
    delete: "/hospital-panel-list/:hospital_panel_list_id", // DELETE
  },
  hospitalStaff: {
    getAdminsForSuperAdmin: "/hospital-staff/admin",  // GET
    insert: "/hospital-staff", // POST
    delete: "/hospital-staff/:hospital_staff_id", // DELETE
    get: "/hospital-staff", // GET
    getAll: "/hospital-staff/all",  // GET

  },
  insuranceCompany: {
    get: "/insurance-company", // GET
    insert: "/insurance-company", // POST
    update: "/insurance-company/:insurance_company_id", // PUT
  },
  labTest: {
    get: "/lab-test", // GET
    insert: "/lab-test", // POST
    update: "/lab-test/:lab_test_id", // PUT
  },
  logs: {
    getAll: "/log", // GET
  },
  medicine: {
    getAll: "/medicine", // GET
    insert: "/medicine", // POST
  },
  notification: {
    getAll: "/notification", // GET
    update: "/notification/:notification_id", // PUT
    updateAll: "/notification", // PUT
    delete: "/notification/:notification_id", // DELETE
    deleteAll: "/notification", // DELETE
  },
  patient: {
    get: "/patient/", // GET
    update: "/patient/", // PUT
  },
  patientInsurance: {
    get: "/patient-insurance",  // GET
    insert: "/patient-insurance",  // POST
    sendVerificationRequest: "/patient-insurance/verify/:patient_insurance_id",  // POST
    update: "/patient-insurance/:patient_insurance_id",  // PUT
    delete: "/patient-insurance/:patient_insurance_id",  // DELETE
  },
  person: {
    get: "/person", // GET
    update: "/person", // PUT
    delete: "/person", // DELETE
  },
  prescription: {
    insert: "/prescription", // POST
    getAgainstAppointment: "/prescription", // GET
  },
  systemAdmin: {
    getAll: "/system-admin", // GET
    insert: "/system-admin", // POST
    delete: "/system-admin/:system_admin_id", // DELETE
  },
  document: {
    get: '/document/:document_id',  // GET
    getUnverified: '/document/unverified',  // GET
    getVerified: '/document/verified',  // GET
    getAll: '/document/all',  // GET
    getAgainstAppointment: '/document/appointment',  // GET
    uploadUnverified: '/document/upload/unverified',  // POST
    uploadVerified: '/document/upload/verified',  // POST
    download: '/document/download/:document_id',  // GET
    // delete: '/document/:document_id',  // DELETE
    // verify: '/document/verify/:document_id',  // POST
  }
} as const;

export default EndPoints;
