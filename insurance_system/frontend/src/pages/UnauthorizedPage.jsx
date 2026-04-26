import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Button from '../components/ui/Button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary p-6 text-center shadow-lg">
        <div className="mx-auto h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center justify-center mb-4">
          <Lock size={36} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-5">
          You do not have permission to access this page.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;