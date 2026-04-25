import React from 'react';

const VARIANT_STYLES = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed',
  ghost: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] disabled:text-gray-400 disabled:cursor-not-allowed',
};

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${VARIANT_STYLES[variant] || VARIANT_STYLES.primary} ${SIZE_STYLES[size] || SIZE_STYLES.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
