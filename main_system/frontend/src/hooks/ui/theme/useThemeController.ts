import { useThemeStore } from '../../../stores/ui';

/**
 * Controller hook for theme state management
 * This is the only way to access theme state - components should never access the store directly
 */
export const useThemeController = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  return {
    // State
    theme,
    isDark: theme === 'dark',
    
    // Actions
    setTheme,
    toggleTheme,
  };
};
