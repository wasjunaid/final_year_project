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
          {/* TODO: remove Tests */}
          <Route
            path={ROUTES.TABLE_COMPONENT_TEST}
            element={<TableComponentTest />}
          />
          <Route
            path={ROUTES.PATIENT_PORTAL_TEST}
            element={<PatientPortalTest />}
          />
          <Route
            path={ROUTES.COMPONENTS_TEST}
            element={<ComponentsTestPage />}
          />

          {/* Default to landing page */}
          <Route path={ROUTES.HOME} element={<ComponentsTestPage />} />

          {/* Auth Routes */}
          <Route path={ROUTES.AUTH.VERIFY_EMAIL} element={<LandingPage />} />
          <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<LandingPage />} />
          <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<LandingPage />} />
          <Route path={ROUTES.AUTH.SIGN_UP} element={<LandingPage />} />
          <Route path={ROUTES.AUTH.SIGN_IN} element={<LandingPage />} />

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
