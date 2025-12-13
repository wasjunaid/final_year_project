import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthController } from '../../hooks/auth';
import { ROLES, type UserRole } from '../../constants/profile';
import ROUTES from '../../constants/routes';
import logo from '../../assets/logo.png';
import bgImg from '../../assets/bg-img.png';
import Alert from '../../components/Alert';
import TextInput from '../../components/TextInput';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';

// QuickLogins component: fills automatically when a preset is selected.
const QuickLogins: React.FC<{ onSelect: (email: string, password: string, role: UserRole) => void; disabled?: boolean }> = ({ onSelect, disabled }) => {
  const quickLogins = [
    { label: 'Super Admin', email: 'superadmin@example.com', password: 'Test@123', role: ROLES.SYSTEM_ADMIN as UserRole },
    { label: 'System Sub Admin', email: 'subadmin@example.com', password: 'Test@123', role: ROLES.SYSTEM_SUB_ADMIN as UserRole },
    { label: 'Hospital Admin', email: 'hospitaladmin@example.com', password: 'Test@123', role: ROLES.HOSPITAL_ADMIN as UserRole },
    { label: 'Front Desk', email: 'frontdesk@example.com', password: 'Test@123', role: ROLES.HOSPITAL_FRONT_DESK as UserRole },
    { label: 'Lab Technician', email: 'labtech@example.com', password: 'Test@123', role: ROLES.HOSPITAL_LAB_TECHNICIAN as UserRole },
    { label: 'Doctor', email: 'doctor@example.com', password: 'Test@123', role: ROLES.DOCTOR as UserRole },
    { label: 'Medical Coder', email: 'medicalcoder@example.com', password: 'Test@123', role: ROLES.MEDICAL_CODER as UserRole },
    { label: 'Patient', email: 'patient@example.com', password: 'Test@123', role: ROLES.PATIENT as UserRole },
  ];

  const options = quickLogins.map((q, i) => ({ value: String(i), label: `${q.label} — ${q.email}` }));

  const handleSelect = (value: string) => {
    if (!value) return;
    const idx = Number(value);
    const q = quickLogins[idx];
    if (q) onSelect(q.email, q.password, q.role);
  };

  return (
    <div className="mt-2">
      <Dropdown
        label={<span className="text-red-600">Quick Logins</span>}
        options={options}
        value={''}
        onChange={(value) => handleSelect(value)}
        placeholder="Choose a test account"
        disabled={disabled}
        fullWidth
      />
    </div>
  );
};

const LoginPage: React.FC = () => {
  const {
    signIn,
    loading,
    error,
    success,
    isAuthenticated,
    emailVerificationNeeded,
    sendEmailVerification,
    clearMessages,
    navigateToPortal,
  } = useAuthController();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ROLES.PATIENT as UserRole,
    rememberMe: false,
  });

  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    await signIn(formData, formData.rememberMe);
    // Navigation will happen via useEffect watching isAuthenticated
  };

  const handleResendVerification = async () => {
    if (!formData.email) return;
    
    setResendLoading(true);
    await sendEmailVerification(formData.email);
    setResendLoading(false);
  };

  const applyQuickLogin = (email: string, password: string, role: UserRole) => {
    setFormData({ email, password, role, rememberMe: false });
    // Optionally auto-submit: comment/uncomment the next line if you want auto sign-in
    // signIn({ email, password, role }, false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-8" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#404040] p-8 md:p-12 w-full max-w-xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-[#e5e5e5] mb-2">Welcome Back</h1>
          <p className="text-gray-500 dark:text-[#a0a0a0]">Sign in to your account</p>
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
        {error && (
          <Alert 
            type="error"
            title={error.title}
            message={error.message}
            subtitle={error.subtitle}
            onClose={clearMessages}
            className="mb-6"
          />
        )}

        {/* Email Verification Warning */}
        {emailVerificationNeeded && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
            <p className="text-sm font-medium mb-2">Please verify your email before signing in.</p>
            <Button
              variant="link"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick logins dropdown - fills the form with preset credentials */}
          <QuickLogins onSelect={applyQuickLogin} disabled={loading} />
          <div className='border-t border-gray-300'/>
          
          <TextInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={loading}
          />

          <TextInput
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            placeholder="••••••••"
            disabled={loading}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          />

          <Dropdown
            label="Role"
            options={[
              { value: ROLES.PATIENT, label: 'Patient' },
              { value: ROLES.DOCTOR, label: 'Doctor' },
              { value: ROLES.MEDICAL_CODER, label: 'Medical Coder' },
              { value: ROLES.SYSTEM_ADMIN, label: 'System Admin' },
              { value: ROLES.SYSTEM_SUB_ADMIN, label: 'System Sub Admin' },
              { value: ROLES.HOSPITAL_ADMIN, label: 'Hospital Admin' },
              { value: ROLES.HOSPITAL_SUB_ADMIN, label: 'Hospital Sub Admin' },
              { value: ROLES.HOSPITAL_FRONT_DESK, label: 'Front Desk' },
              { value: ROLES.HOSPITAL_LAB_TECHNICIAN, label: 'Lab Technician' },
            ]}
            value={formData.role}
             onChange={(value) => setFormData((prev) => ({ ...prev, role: value as UserRole }))} 
            disabled={loading}
            fullWidth
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-[#a0a0a0]">
                Remember me
              </label>
            </div>
            <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary">
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit"
            variant="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-[#a0a0a0]">
            Don't have an account?{' '}
            <Button variant="link" onClick={() => navigate(ROUTES.AUTH.SIGN_UP)}>Sign up</Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
