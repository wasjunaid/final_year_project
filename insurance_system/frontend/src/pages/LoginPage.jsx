// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/forms/LoginForm';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      await login(data.email, data.password, data.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-dark-bg dark:via-[#212131] dark:to-[#20243a] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary dark:text-blue-300 flex items-center justify-center mb-3">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Insurance Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to continue</p>
        </div>

        <LoginForm onSubmit={handleSubmit} error={error} loading={loading} />
      </div>
    </div>
  );
};

export default LoginPage;