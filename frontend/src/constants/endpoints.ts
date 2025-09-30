const EndPoints = {
  auth: {
    signIn: "/auth/sign-in", //POST
    signUp: "/auth/sign-up", //POST
    refreshToken: "/auth/refresh-jwt", //POST
    google: "/auth/google",
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
    patient: "/appointment/patient", //GET
    doctor: "/appointment/doctor", //GET
    hospital: "/appointment/hospital", //GET
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
  logs: "/log", //GET
  documents: {
    // "/document",
    get: "/document", //GET
    upload: "/document/upload", //POST
  },
  systemAdmin: {
    getAll: "/system/admin", // GET
    create: "/system/admin", // POST
    delete: "/system/admin", // DELETE /:system_admin_id
  },
  ehr: {
    // "/ehr/access-request"
    // "/ehr/access"
    // "/ehr"
  },
} as const;

export default EndPoints;
