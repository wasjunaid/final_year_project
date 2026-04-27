import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeController } from '../hooks/ui/theme';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'switch' | 'labeled-switch';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const { theme, toggleTheme } = useThemeController();
  const isDark = theme === 'dark';

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors ${className}`}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <>
            <Sun size={18} />
            <span className="text-sm font-medium">Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={18} />
            <span className="text-sm font-medium">Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  // Labeled Switch variant - for sidebar
  if (variant === 'labeled-switch') {
    return (
      <div className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors ${className}`}>
        <div className="flex items-center gap-2">
          {isDark ? <Moon size={18} className="text-gray-700 dark:text-dark-text-primary" /> : <Sun size={18} className="text-gray-700 dark:text-dark-text-primary" />}
          <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Dark mode</span>
        </div>
        <button
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isDark ? 'bg-primary' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDark ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  }

  // Switch variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Sun size={16} className="text-gray-600 dark:text-gray-400" />
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isDark ? 'bg-primary' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <Moon size={16} className="text-gray-600 dark:text-gray-400" />
    </div>
  );
};

export default ThemeToggle;
