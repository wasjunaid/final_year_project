const ROUTES = {
  //auth routes
  AUTH: {
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
    GOOGLE_AUTH_SUCCESS: "/google/success",
  },

  //landing page
  HOME: "/",

  //portals
  ADMIN_PORTAL: "/admin",
  PATIENT_PORTAL: "/patient",
  DOCTOR_PORTAL: "/doctor",
  FRONT_DESK_PORTAL: "/front-desk",
  HOSPITAL_PORTAL: "/hospital",
  MEDICAL_CODER_PORTAL: "/medical-coder",
  LAB_TECHNICIAN_PORTAL: "/lab-technician",

  // other routes
  APPOINTMENT_DETAIL: "/appointment-detail",
  APPOINTMENT_REQUEST_DETAILS: "/appointment-request-details",

  // Document Routes
  DOCUMENTS: '/documents',
  UPLOAD_DOCUMENT: '/upload-document',
  DOCUMENT_DETAILS: '/document-details/:documentId',

  // EHR Access Routes
  EHR_ACCESS_REQUESTS: '/ehr-access-requests',
  CREATE_EHR_ACCESS_REQUEST: '/create-ehr-access-request',
  EHR_DETAILS: '/ehr-details',

  // NOT_FOUND: "/not-found",
} as const;

export default ROUTES;
