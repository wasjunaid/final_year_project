import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/landing/LandingPage";
import ROUTES from "./constants/routes";
import { ROLES, type UserRole } from "./constants/roles";
import { useAuth } from "./hooks/useAuth";
import PatientPortalLayout from "./pages/patient/PatientPortalLayout";
import DoctorPortalLayout from "./pages/doctor/DoctorPortalLayout";
import HospitalPortalLayout from "./pages/hospital/HospitalPortalLayout";
import FrontDeskPortalLayout from "./pages/front_desk/FrontDeskPortalLayout";
import AdminPortalLayout from "./pages/admin/AdminPortalLayout";
import MedicalCoderPortalLayout from "./pages/medical_coder/MedicalCoderPortalLayout";
import SignUpPage from "./pages/auth/SignUpPage";
import SignInPage from "./pages/auth/SignInPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EmailVerification from "./pages/auth/EmailVerification";
import AppointmentRequestDetails from "./pages/appointments/AppointmentRequestDetails";
import AppointmentDetailsPage from "./pages/appointments/AppointmentDetailPage";
import GoogleAuthSuccess from "./pages/auth/GoogleAuthSuccess";
import DocumentDetailsPage from "./pages/documents/DocumentDetailsPage";

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Protected route wrapper
function Protected({ children, allowedRoles }: ProtectedProps) {
  const { role, initialized } = useAuth();

  if (!initialized) return null; // or a loader

  if (!role) return <Navigate to={ROUTES.AUTH.SIGN_IN} />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.HOME} />;
  }

  return <>{children}</>;
}


function App() {
  return (
    <Router>
      <div className="bg-background h-screen">
        <Routes>
          {/* Auth Routes */}
          <Route
            path={ROUTES.AUTH.VERIFY_EMAIL}
            element={<EmailVerification />}
          />
          <Route
            path={ROUTES.AUTH.FORGOT_PASSWORD}
            element={<ForgotPasswordPage />}
          />
          <Route
            path={ROUTES.AUTH.RESET_PASSWORD}
            element={<ResetPasswordPage />}
          />
          <Route path={ROUTES.AUTH.SIGN_UP} element={<SignUpPage />} />
          <Route path={ROUTES.AUTH.SIGN_IN} element={<SignInPage />} />
          <Route
            path={ROUTES.AUTH.GOOGLE_AUTH_SUCCESS}
            element={<GoogleAuthSuccess />}
          />

          {/* Portals */}
          <Route
            path={ROUTES.ADMIN_PORTAL}
            element={
              <Protected allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                <AdminPortalLayout />
              </Protected>
            }
          />

          <Route
            path={ROUTES.PATIENT_PORTAL}
            element={
              <Protected allowedRoles={[ROLES.PATIENT]}>
                <PatientPortalLayout />
              </Protected>
            }
          />

          <Route
            path={ROUTES.DOCTOR_PORTAL}
            element={
              <Protected allowedRoles={[ROLES.DOCTOR]}>
                <DoctorPortalLayout />
              </Protected>
            }
          />

          <Route
            path={ROUTES.HOSPITAL_PORTAL}
            element={
              <Protected
                allowedRoles={[ROLES.HOSPITAL_ADMIN, ROLES.HOSPITAL_SUB_ADMIN]}
              >
                <HospitalPortalLayout />
              </Protected>
            }
          />

          <Route
            path={ROUTES.FRONT_DESK_PORTAL}
            element={
              <Protected allowedRoles={[ROLES.HOSPITAL_FRONT_DESK]}>
                <FrontDeskPortalLayout />
              </Protected>
            }
          />

          <Route
            path={ROUTES.MEDICAL_CODER_PORTAL}
            element={
              <Protected allowedRoles={[ROLES.MEDICAL_CODER]}>
                <MedicalCoderPortalLayout />
              </Protected>
            }
          />

          {/* landing page */}
          <Route path={ROUTES.HOME} element={<LandingPage />} />

          {/* Other Routes */}

          <Route
            path={ROUTES.APPOINTMENT_REQUEST_DETAILS}
            element={
              <Protected>
                <AppointmentRequestDetails />
              </Protected>
            }
          />
          <Route
            path={ROUTES.APPOINTMENT_DETAIL}
            element={
              <Protected>
                <AppointmentDetailsPage />
              </Protected>
            }
          />
          <Route
            path={ROUTES.DOCUMENT_DETAILS}
            element={
              <Protected>
                <DocumentDetailsPage />
              </Protected>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
