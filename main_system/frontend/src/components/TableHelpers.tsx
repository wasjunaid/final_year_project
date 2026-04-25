import React from 'react';

// Helper component for stacked content in cells
export const StackedCell: React.FC<{
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tertiary?: React.ReactNode;
}> = ({ primary, secondary, tertiary }) => (
  <div>
    <div className="font-semibold text-gray-800 dark:text-[#e5e5e5]">{primary}</div>
    {secondary && <div className="text-sm text-gray-600 dark:text-[#a0a0a0] mt-1">{secondary}</div>}
    {tertiary && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{tertiary}</div>}
  </div>
);

// Helper component for badges
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}> = ({ children, variant = 'primary' }) => {
  const variantClasses = {
    primary: 'bg-primary/10 text-primary dark:bg-primary/20',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

// Helper component for action buttons
export const ActionButtons: React.FC<{
  buttons: {
    label?: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'success' | 'danger' | 'secondary';
    disabled?: boolean;
  }[];
}> = ({ buttons }) => {
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    success: 'bg-green-500 text-white hover:bg-green-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
  };

  return (
    <div className="flex gap-2">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            button.onClick();
          }}
          disabled={button.disabled}
          className={`px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            variantClasses[button.variant || 'primary']
          }`}
        >
          {button.icon ? (
            <span className="flex items-center gap-1">
              {button.icon}
              {button.label}
            </span>
          ) : (
            button.label
          )}
        </button>
      ))}
    </div>
  );
};

// Helper component for icon with text
export const IconText: React.FC<{
  icon: React.ReactNode;
  text: React.ReactNode;
  iconColor?: string;
}> = ({ icon, text, iconColor = 'text-gray-600' }) => (
  <div className="flex items-center gap-2">
    <div className={iconColor}>{icon}</div>
    <span>{text}</span>
  </div>
);

// Helper component for avatar with text
export const AvatarCell: React.FC<{
  name: string;
  subtitle?: string;
  avatarUrl?: string;
}> = ({ name, subtitle, avatarUrl }) => (
  <div className="flex items-center gap-3">
    {avatarUrl ? (
      <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
    ) : (
      <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
        {name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </div>
    )}
    <div>
      <div className="font-semibold text-gray-800">{name}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  </div>
);
