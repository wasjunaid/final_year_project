const EndPoints = {
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    refreshToken: "/auth/refresh-token",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    sendOrResendEmailVerification: "/auth/send-or-resend-email-verification",
    google: "/auth/google",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
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
