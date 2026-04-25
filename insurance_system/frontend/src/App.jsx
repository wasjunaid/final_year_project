// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ROLES } from './constants/roles';

// Import pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClaimsPage from './pages/ClaimsPage';
import HospitalsPage from './pages/HospitalsPage';
import InsurancesPage from './pages/InsurancesPage';
import PersonsPage from './pages/PersonsPage';
import UsersPage from './pages/UsersPage';
import InsuranceCompaniesPage from './pages/InsuranceCompaniesPage';
import InsuranceStaffPage from './pages/InsuranceStaffPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import PersonInsurancePage from './pages/PersonInsurancePage';
import InsurancePanelPage from './pages/InsurancePanelPage';
import WalletBalancePage from './pages/WalletBalancePage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/claims"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN]}
                  >
                    <ClaimsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hospitals"
                element={
                  <ProtectedRoute>
                    <HospitalsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/insurances"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN]}
                  >
                    <InsurancesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/insurance-companies"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <InsuranceCompaniesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/insurance-staff"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN]}>
                    <InsuranceStaffPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/persons"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN]}
                  >
                    <PersonsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/person-insurance"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN]}
                  >
                    <PersonInsurancePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/insurance-panel"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN]}
                  >
                    <InsurancePanelPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/wallet-balance"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN]}
                  >
                    <WalletBalancePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment-history"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN]}
                  >
                    <PaymentHistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;