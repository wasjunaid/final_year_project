const EndPoints = {
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    refreshToken: "/auth/refresh-token",
    google: "/auth/google",
    forgotPassword: "/token/password-reset",
    resetPassword: "/token/password-reset/reset",
  },
  emailVerification: {
    verify: "/token/email-verification/verify",
    sendOrResend: "/token/email-verification/",
  },
  patient: {
    dashboard: "/patient/dashboard",
    appointments: "/patient/appointments",
    profile: "/patient/profile",
  },
  doctor: {
    dashboard: "/doctor/dashboard",
    appointments: "/doctor/appointments",
    profile: "/doctor/profile",
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
  },
} as const;

export default EndPoints;
