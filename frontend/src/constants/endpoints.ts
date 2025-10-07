const EndPoints = {
  auth: {
    signIn: "/auth/sign-in", //POST
    signUp: "/auth/sign-up", //POST
    refreshToken: "/auth/refresh-jwt", //POST
    google: "/auth/google", //GET
    // googleCallback: "/auth/google/callback", //GET (handled by backend)
    forgotPassword: "/token/password-reset", //POST
    resetPassword: "/token/password-reset/reset", //POST
  },
  emailVerification: {
    verify: "/token/email-verification/verify", //POST
    sendOrResend: "/token/email-verification/", //POST
  },
  notification: {
    list: "/notification", // GET
  },
  person: {
    get: "/person", // GET
    update: "/person", // PUT
  },
  patient: {
    // dashboard: "/patient/dashboard",
    profile: "/patient/profile",
  },
  doctor: {
    dashboard: "/doctor/dashboard",
    profile: "/doctor/", //GET
    getForHospital: "/doctor/hospital/", //GET (:hospital_id)
    getAll: "/doctor/getAll", //GET
  },
  hospital: {
    create: "/hospital/", //POST (name, address)
    get: "/hospital/", //GET
    update: "/hospital/", //PUT (:hospital_id) (name, address)
    delete: "/hospital/", //DELETE (:hospital_id)
  },
  hospitalStaff: {
    get: "/hospital/staff", //GET ({persion_id})
    // /super-admin/all-hospital-admins
    getAll: "/hospital/staff", // GET (:hospital_id)
    insert: "/hospital/staff", //POST  ({email, hospital_id, role})
    delete: "/hospital/staff", //DELETE (:hospital_staff_id)
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    allHospitals: "/hospital/staff/super-admin/all-hospital-admins",
  },
  appointments: {
    uploadNote: "/doctor/note/", //POST ({appointment_id, note})
    getNote: "/doctor/note/", //GET (:appointment_id)
    updateStatus: "/appointment/", //PUT (:appointment_id)
    patient: "/appointment/patient", //GET
    doctor: "/appointment/doctor", //GET
    hospital: "/appointment/hospital", //GET
    get: "/appointment/appointment-details/", //GET (:appointment_id)
    update: "/appointment/", //PUT (:appointment_id)
    request: {
      insert: "/appointment/request/", //POST
      patient: "/appointment/request/patient", //GET
      hospital: "/appointment/request/hospital", //GET
      updateHospitalStatus: "/appointment/request/hospital", //PUT (:appointment_request_id)
      reschedule: "/appointment/request/reschedule/", //PUT (:appointment_request_id)
      cancel: "/appointment/request/cancel/", //PUT (:appointment_request_id)
    },
  },
  hospitalAssociationRequest: {
    person: "/hospital/association-request/person", // GET - Get requests for logged-in person
    hospital: "/hospital/association-request/hospital/", // GET (:hospital_id) - Get requests for hospital
    create: "/hospital/association-request/", // POST - Create new request
    approve: "/hospital/association-request/approve/", // PUT (:hospital_association_request_id)
    delete: "/hospital/association-request/", // DELETE (:hospital_association_request_id)
    deleteByPersonAndRole: "/hospital/association-request/person", // DELETE - Delete by person and role
  },
  logs: "/log", //GET
  documents: {
    get: "/document", //GET
    upload: "/document/upload", //POST
  },
  systemAdmin: {
    getAll: "/system/admin", // GET
    create: "/system/admin", // POST
    delete: "/system/admin", // DELETE /:system_admin_id
  },
  ehrAccess: {
    patient: "/ehr/access/patient/requests", //GET
    doctor: "/ehr/access/doctor/requests", //GET
    create: "/ehr/access", //POST
    updateStatus: "/ehr/access/status", //PUT (:ehr_access_request_id)
    grant: "/ehr/access/grant", //PUT (:ehr_access_request_id)
    revoke: "/ehr/access/revoke", //PUT (:ehr_access_request_id)
  },
  ehrAccessRequest: {
    get: "/ehr/access-request", //GET
    patient: "/ehr/access-request/patient/requests", //GET
    doctor: "/ehr/access-request/doctor/requests", //GET
    create: "/ehr/access-request", //POST
    approve: "/ehr/access-request/approve", //PUT (:ehr_access_request_id)
    revoke: "/ehr/access-request/revoke", //PUT (:ehr_access_request_id)
  },
  ehr: {
    appointment: "/ehr/appointment", //GET
    doctor: "/ehr/doctor", //GET
  },
} as const;

export default EndPoints;
