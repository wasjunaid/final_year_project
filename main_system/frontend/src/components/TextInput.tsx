import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  minWidth?: string;
  maxWidth?: string;
  required?: boolean;
  // Password visibility toggle props
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  rightIcon?: React.ReactNode;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  multiline = false,
  rows = 4,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helperClassName = '',
  minWidth,
  maxWidth,
  required = false,
  showPasswordToggle = false,
  onTogglePassword,
  rightIcon,
  ...inputProps
}) => {
  const containerStyles = {
    minWidth: minWidth,
    maxWidth: maxWidth,
  };

  const baseInputClasses = `w-full border border-gray-300 dark:border-[#404040] dark:bg-[#3a3a3a] dark:text-[#e5e5e5] p-2.5 md:p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base [color-scheme:light] dark:[color-scheme:dark] ${
    error ? 'border-red-500 dark:border-red-500' : ''
  }`;

  const mergedInputClasses = `${baseInputClasses} ${inputClassName}`;

  const baseLabelClasses = 'block text-sm font-semibold text-gray-700 dark:text-[#e5e5e5] mb-2';
  const mergedLabelClasses = `${baseLabelClasses} ${labelClassName}`;

  const baseErrorClasses = 'text-xs text-red-600 dark:text-red-400 mt-1';
  const mergedErrorClasses = `${baseErrorClasses} ${errorClassName}`;

  const baseHelperClasses = 'text-xs text-gray-500 dark:text-[#a0a0a0] mt-1';
  const mergedHelperClasses = `${baseHelperClasses} ${helperClassName}`;

  return (
    <div className={containerClassName} style={containerStyles}>
      {label && (
        <label className={mergedLabelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {multiline ? (
        <textarea
          {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={rows}
          className={mergedInputClasses}
        />
      ) : (
        <div className="relative">
          <input
            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
            className={mergedInputClasses}
          />
          {(showPasswordToggle || rightIcon) && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          )}
        </div>
      )}

      {error && <p className={mergedErrorClasses}>{error}</p>}
      {!error && helperText && <p className={mergedHelperClasses}>{helperText}</p>}
    </div>
  );
};

export default TextInput;
