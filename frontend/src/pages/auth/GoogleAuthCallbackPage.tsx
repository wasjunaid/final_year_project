import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import logo from '../../assets/logo.png';
import bgImg from '../../assets/bg-img.png';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

const GoogleAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (!accessToken || !refreshToken) {
          throw new Error('Authentication tokens not received from Google');
        }

        // Set authentication state
        setAuth({
          accessToken,
          refreshToken,
        });

        // Clear stored role from sessionStorage
        sessionStorage.removeItem('google-auth-role');

        // Redirect to appropriate portal
        // This will be handled by the auth store listener
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Google authentication failed');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, setAuth, navigate]);

  const handleRetry = () => {
    navigate('/sign-in');
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-8" style={{ backgroundImage: `url(${bgImg})` }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#404040] p-8 md:p-12 w-full max-w-md text-center">
          <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-6" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#e5e5e5] mb-2">
            Completing Sign In
          </h1>
          <p className="text-gray-600 dark:text-[#a0a0a0]">
            Please wait while we complete your Google authentication...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-8" style={{ backgroundImage: `url(${bgImg})` }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#404040] p-8 md:p-12 w-full max-w-md">
          <div className="text-center mb-6">
            <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#e5e5e5] mb-2">
              Authentication Failed
            </h1>
          </div>

          <Alert 
            type="error"
            title="Google Authentication Failed"
            message={error}
            className="mb-6"
          />

          <Button
            variant="primary"
            onClick={handleRetry}
            fullWidth
          >
            Return to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // This shouldn't be reached, but just in case
  return null;
};

export default GoogleAuthCallbackPage;