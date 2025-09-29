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
    profile: "/doctor/profile",
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
  },
} as const;

export default EndPoints;
