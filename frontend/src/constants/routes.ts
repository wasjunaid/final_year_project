const ROUTES = {
  //auth routes
  AUTH: {
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
    GOOGLE_AUTH_SUCCESS: "/auth/google/success",
  },

  //landing page
  HOME: "/",

  //portals
  SYSTEM_ADMIN_PORTAL: "/admin",
  PATIENT_PORTAL: "/patient",
  DOCTOR_PORTAL: "/doctor",
  MEDICAL_CODER_PORTAL: "/medical-coder",
  HOSPITAL_PORTAL: "/hospital",
  FRONT_DESK_PORTAL: "/front-desk",
  LAB_TECHNICIAN_PORTAL: "/lab-technician",
  PHARMACIST_PORTAL: "/pharmacist",
} as const;

export default ROUTES;
