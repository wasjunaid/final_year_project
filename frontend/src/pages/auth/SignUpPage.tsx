import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthController } from '../../hooks/auth';
import { ROLES } from '../../constants/profile';
import ROUTES from '../../constants/routes';
import logo from '../../assets/logo.png';
import bgImg from '../../assets/bg-img.png';
import Alert from '../../components/Alert';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Dropdown from '../../components/Dropdown';
import { useNavigate } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const {
    signUp,
    loading,
    error,
    success,
    isAuthenticated,
    clearMessages,
    navigateToPortal,
  } = useAuthController();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.PATIENT,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigateToPortal();
    }
  }, [isAuthenticated, navigateToPortal]);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => clearMessages();
  }, [clearMessages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    
    const { confirmPassword, ...signupPayload } = formData;
    await signUp(signupPayload);
    
    // Navigation will happen via useEffect or redirect to verify email
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat py-8" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#404040] p-8 md:p-12 w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-[#e5e5e5] mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-[#a0a0a0]">Join our healthcare platform</p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert 
            type="success"
            title={success.title}
            message={success.message}
            subtitle={success.subtitle}
            onClose={clearMessages}
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <TextInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            disabled={loading}
          />

          <Dropdown
            label="Role"
            options={[
              { value: ROLES.PATIENT, label: 'Patient' },
              { value: ROLES.DOCTOR, label: 'Doctor' },
            ]}
            value={formData.role}
            onChange={(value) => handleChange({ target: { name: 'role', value } } as any)}
            required
            disabled={loading}
            fullWidth
          />

          <TextInput
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="••••••••"
            disabled={loading}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            helperText="At least 8 characters"
          />

          <TextInput
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="••••••••"
            disabled={loading}
            showPasswordToggle
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            rightIcon={showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-[#a0a0a0]">
              I agree to the{' '}
              <a href="#" className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-[#a0a0a0]">
            Already have an account?{' '}
            <Button variant="link" onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}>Sign in</Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
