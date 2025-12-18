import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthController } from '../../hooks/auth';
import logo from '../../assets/logo.png';
import bgImg from '../../assets/bg-img.png';
import ROUTES from '../../constants/routes';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, loading, error, success, clearMessages } = useAuthController();
  const [token, setToken] = useState<string | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  // Get token from URL on mount
  useEffect(() => {
    const urlToken = searchParams.get('token');
    setToken(urlToken);
  }, [searchParams]);

  const handleVerify = async () => {
    if (!token) {
      return;
    }

    clearMessages();
    setHasVerified(true);
    
    const verified = await verifyEmail(token);
    
    if (verified) {
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.AUTH.SIGN_IN);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url(${bgImg})` }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#404040] p-8 md:p-12 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-[#e5e5e5] mb-2">Email Verification</h1>
          <p className="text-gray-500 dark:text-[#a0a0a0]">
            {loading ? 'Verifying your email...' : 
             success ? 'Verification successful!' : 
             'Click below to verify your email'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center py-8 mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-[#a0a0a0]">Please wait while we verify your email...</p>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Alert 
              type="success" 
              title={success.title}
              message={success.message}
              subtitle={success.subtitle || 'Redirecting to sign in...'}
            />
          </div>
        )}

        {/* Error State */}
        {error && hasVerified && (
          <div className="mb-6">
            <Alert 
              type="error" 
              title={error.title}
              message={error.message}
              subtitle={error.subtitle}
            />
          </div>
        )}

        {/* No Token Warning */}
        {!token && !loading && (
          <Alert 
            type="warning"
            title="Missing Verification Token"
            message="Please check your email and click the verification link provided."
            className="mb-6"
          />
        )}

        {/* Verify Button - only show if not loading, not successful, and has token */}
        {!loading && !success && token && (
          <Button variant="primary" fullWidth onClick={handleVerify}>
            Verify Email
          </Button>
        )}

        {/* Go to Login Button - show after successful verification */}
        {success && (
          <Button variant="success" fullWidth onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}>
            Go to Login
          </Button>
        )}

        {/* Back to Sign In Link, dont show if already successful */}
        {!success && (
          <div className="text-center mt-2">
            <Button variant="secondary" fullWidth onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}>
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
