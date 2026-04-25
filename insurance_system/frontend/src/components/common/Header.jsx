import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { capitalizeFirstLetter } from '../../utils/formatters';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-gray-200 dark:border-[#404040] bg-white/95 dark:bg-[#2d2d2d]/95 backdrop-blur">
      <div className="h-full pl-4 pr-4 md:pl-4 md:pr-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary dark:text-white font-semibold">
          <Shield size={18} />
          <span>Insurance Portal</span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
              {user.email} ({capitalizeFirstLetter(user.role)})
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;