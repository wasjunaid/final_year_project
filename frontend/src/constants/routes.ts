const ROUTES = {
  //tests
  COMPONENTS_TEST: "/components-test",
  PATIENT_PORTAL_TEST: "/patient-portal-test",
  TABLE_COMPONENT_TEST: "/table-component-test",

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
  ADMIN_PORTAL: "/admin",
  PATIENT_PORTAL: "/patient",
  DOCTOR_PORTAL: "/doctor",
  FRONT_DESK_PORTAL: "/front-desk",
  HOSPITAL_PORTAL: "/hospital",
  MEDICAL_CODER_PORTAL: "/medical-coder",

  // NOT_FOUND: "/not-found",
};

export default ROUTES;
