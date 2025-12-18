import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthController } from '../../hooks/auth';
import logo from '../../assets/logo.png';
import bgImg from '../../assets/bg-img.png';
import ROUTES from '../../constants/routes';
import Alert from '../../components/Alert';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, loading, error, success, clearMessages } = useAuthController();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');
  const [token, setToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get token from URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setValidationError('');

    // Validate token exists
    if (!token) {
      setValidationError('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    
    // Backend only needs token and new password (no email required)
    const success = await resetPassword(token, formData.newPassword);
    
    if (success) {
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate(ROUTES.AUTH.SIGN_IN);
      }, 2000);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url(${bgImg})` }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border p-8 md:p-12 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-2">Reset Password</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary">Enter your new password</p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert 
            type="success"
            title={success.title}
            message={success.message}
            subtitle={success.subtitle || 'Redirecting to sign in...'}
            className="mb-6"
          />
        )}

        {/* Error Alert */}
        {displayError && (
          <Alert 
            type="error"
            title={typeof displayError === 'string' ? 'Error' : displayError.title}
            message={typeof displayError === 'string' ? displayError : displayError.message}
            subtitle={typeof displayError === 'string' ? undefined : displayError.subtitle}
            onClose={() => {
              clearMessages();
              setValidationError('');
            }}
            className="mb-6"
          />
        )}

        {/* No Token Warning */}
        {!token && (
          <Alert 
            type="warning"
            title="Invalid reset link"
            message="Please request a new password reset from the login page."
            className="mb-6"
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="••••••••"
            disabled={loading || !token}
            showPasswordToggle
            onTogglePassword={() => setShowNewPassword(!showNewPassword)}
            rightIcon={showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            helperText="At least 8 characters"
          />

          <TextInput
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="••••••••"
            disabled={loading || !token}
            showPasswordToggle
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            rightIcon={showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading || !token}
            fullWidth
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        {/* Back to Sign In */}
        <div className="mt-2 text-center">
          <Button variant="secondary" onClick={() => navigate(ROUTES.AUTH.SIGN_IN)} fullWidth>
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
