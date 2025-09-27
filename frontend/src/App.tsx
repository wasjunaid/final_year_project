import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/landing/LandingPage";
import ROUTES from "./constants/routes";
import type { UserRole } from "./constants/roles";
import { useAuth } from "./hooks/useAuth";
import ComponentsTestPage from "./components/tests/ComponentsTestPage";
import PatientPortalTest from "./components/tests/PatientPortalTest";
import TableComponentTest from "./components/tests/TableComponentTest";
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

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Protected route wrapper
function Protected({ children, allowedRoles }: ProtectedProps) {
  const { person } = useAuth();

  if (!person) return <Navigate to={ROUTES.AUTH.SIGN_IN} />;

  if (allowedRoles && !allowedRoles.includes(person.role)) {
    return <Navigate to={ROUTES.HOME} />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <div className="bg-background h-screen">
        <Routes>
          {/* Default to landing page */}
          <Route path={ROUTES.HOME} element={<LandingPage />} />

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

          {/* Admin Routes */}
          <Route path={ROUTES.ADMIN} element={<AdminPortalLayout />} />

          {/* Patient Routes */}
          <Route
            path={ROUTES.PATIENT_PORTAL}
            element={<PatientPortalLayout />}
          />

          {/* Doctor Routes */}
          <Route path={ROUTES.DOCTOR_PORTAL} element={<DoctorPortalLayout />} />

          {/* Hospital Routes */}
          <Route path={ROUTES.HOSPITAL} element={<HospitalPortalLayout />} />

          {/* Front Desk Routes */}
          <Route path={ROUTES.FRONT_DESK} element={<FrontDeskPortalLayout />} />

          {/* Medical Coder Routes */}
          <Route
            path={ROUTES.MEDICAL_CODER}
            element={<MedicalCoderPortalLayout />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
