import React from 'react';

const TextInput = ({
  label,
  error,
  helperText,
  multiline = false,
  rows = 4,
  className = '',
  required = false,
  ...props
}) => {
  const baseClasses = `w-full border border-gray-300 dark:border-[#404040] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-red-500' : ''}`;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {multiline ? (
        <textarea rows={rows} className={baseClasses} {...props} />
      ) : (
        <input className={baseClasses} {...props} />
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helperText}</p>}
    </div>
  );
};

export default TextInput;
