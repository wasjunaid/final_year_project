import { Navigate } from 'react-router-dom';
import { useAuthController } from '../hooks/auth';
import type { UserRole } from '../constants/profile';
import ROUTES from '../constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, role, initialized } = useAuthController();

  // Wait for store to initialize from localStorage
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    console.log('Redirecting to sign-in: not authenticated');
    return <Navigate to={ROUTES.AUTH.SIGN_IN} replace />;
  }

  // Check role authorization
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log(`Redirecting to home: unauthorized role: ${role}`);
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
