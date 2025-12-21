import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import ROUTES from './constants/routes';
import { ROLES } from './constants/profile';
import { useThemeController } from './hooks/ui/theme';

// auth imports
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import GoogleAuthCallbackPage from './pages/auth/GoogleAuthCallbackPage';

// portal imports
import DoctorPortal from './pages/portals/DoctorPortal';
import PatientPortal from './pages/portals/PatientPortal';
import SystemAdminPortal from './pages/portals/SystemAdminPortal';
import MedicalCoderPortal from './pages/portals/MedicalCoderPortal';
import HospitalAdminPortal from './pages/portals/HospitalAdminPortal';
import HospitalFrontDeskPortal from './pages/portals/HospitalFrontDeskPortal';
import HospitalLabTechnicianPortal from './pages/portals/HospitalLabTechnicianPortal';
import PharmacistPortal from './pages/portals/PharmacistPortal';

function App() {
  // Initialize theme controller to apply saved theme on mount
  const { theme } = useThemeController();
  
  useEffect(() => {
    // Apply theme class on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect - redirects to sign-in */}
        {/* TODO Change this to landing page later */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.AUTH.SIGN_IN} replace />} />
        
        {/* Public auth routes */}
        <Route path={ROUTES.AUTH.SIGN_IN} element={<LoginPage />} />
        <Route path={ROUTES.AUTH.SIGN_UP} element={<SignupPage />} />
        <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.AUTH.VERIFY_EMAIL} element={<EmailVerificationPage />} />
        <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.AUTH.GOOGLE_AUTH_SUCCESS} element={<GoogleAuthCallbackPage />} />
        
        {/* Protected portal routes with role-based access */}
        <Route
          path={`${ROUTES.DOCTOR_PORTAL}/*`}
          element={
            <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
              <DoctorPortal />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={`${ROUTES.PATIENT_PORTAL}/*`}
          element={
            <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
              <PatientPortal />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={`${ROUTES.SYSTEM_ADMIN_PORTAL}/*`}
          element={
            <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.SYSTEM_SUB_ADMIN]}>
              <SystemAdminPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${ROUTES.MEDICAL_CODER_PORTAL}/*`}
          element={
            <ProtectedRoute allowedRoles={[ROLES.MEDICAL_CODER]}>
              <MedicalCoderPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${ROUTES.HOSPITAL_PORTAL}/*`}
          element={
            <ProtectedRoute allowedRoles={[ROLES.HOSPITAL_ADMIN]}>
              <HospitalAdminPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${ROUTES.FRONT_DESK_PORTAL}/*`}
          element={
            <ProtectedRoute allowedRoles={[ROLES.HOSPITAL_FRONT_DESK]}>
              <HospitalFrontDeskPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${ROUTES.LAB_TECHNICIAN_PORTAL}/*`}
          element={
            <ProtectedRoute allowedRoles={[ROLES.HOSPITAL_LAB_TECHNICIAN]}>
              <HospitalLabTechnicianPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${ROUTES.PHARMACIST_PORTAL}/*`}
          element={
            <ProtectedRoute allowedRoles={[ROLES.HOSPITAL_PHARMACIST]}>
              <PharmacistPortal />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all route - redirect to sign-in */}
        <Route path="*" element={<Navigate to={ROUTES.AUTH.SIGN_IN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
