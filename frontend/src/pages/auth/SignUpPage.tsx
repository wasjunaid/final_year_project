import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../hooks/useAuthController';
import type { UserRole } from '../../models/auth';
import logo from '../../assets/logo.png';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loading, error, isAuthenticated, getUserRole, clearError } = useAuthController();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'patient' as UserRole,
  });

  const [validationError, setValidationError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const role = getUserRole();
      if (role === 'doctor') {
        navigate('/doctor');
      } else if (role === 'patient') {
        navigate('/patient');
      } else if (role === 'admin') {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, navigate, getUserRole]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    
    try {
      const { confirmPassword, ...signupPayload } = formData;
      await signup(signupPayload);
      // Navigation will happen via useEffect watching isAuthenticated
    } catch (err) {
      // Error is already set in store
      console.error('Signup failed:', err);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 py-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 md:p-12 w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-500">Join our healthcare platform</p>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{displayError}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="John"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Doe"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              disabled={loading}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-primary hover:text-primary-dark">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:text-primary-dark">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-dark">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
