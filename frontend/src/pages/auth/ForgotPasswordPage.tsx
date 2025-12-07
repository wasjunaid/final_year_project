import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthController } from '../../hooks/auth';
import logo from '../../assets/logo.png';
import bgImg from '../../assets/bg-img.png';
import ROUTES from '../../constants/routes';
import Alert from '../../components/Alert';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';

const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset, loading, error, success, clearMessages } = useAuthController();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!email) return;
    
    await sendPasswordReset(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#404040] p-8 md:p-12 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2 dark:text-[#e5e5e5]">Forgot Password</h1>
          <p className="text-gray-500 dark:text-[#a0a0a0]">Enter your email to reset your password</p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert 
            type="success"
            title={success.title}
            message={success.message}
            subtitle={success.subtitle}
            onClose={clearMessages}
            className="mb-4"
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
            className="mb-4"
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <TextInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        {/* Back to Sign In */}
        <div className="mt-2 text-center">
          <Button variant="secondary" fullWidth onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}>Back to Sign In</Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
