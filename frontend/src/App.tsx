import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DoctorPortal from './pages/portals/DoctorPortal';
import PatientPortal from './pages/portals/PatientPortal';
import AdminPortal from './pages/portals/AdminPortal';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Portal routes - each portal handles its own internal navigation */}
        <Route path="/doctor" element={<DoctorPortal />} />
        <Route path="/patient" element={<PatientPortal />} />
        <Route path="/admin" element={<AdminPortal />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
