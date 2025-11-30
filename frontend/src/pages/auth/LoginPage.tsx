import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../hooks/useAuthController';
import type { UserRole } from '../../models/auth';
import logo from '../../assets/logo.png';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated, getUserRole, clearError } = useAuthController();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient' as UserRole,
  });

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(formData);
      // Navigation will happen via useEffect watching isAuthenticated
    } catch (err) {
      // Error is already set in store
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 md:p-12 w-full max-w-xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              Login As
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-primary hover:text-primary-dark">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
