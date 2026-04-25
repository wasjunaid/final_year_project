import React from 'react';

const Dropdown = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Select an option',
  className = '',
}) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-gray-300 dark:border-[#404040] bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-red-500' : ''}`}
      >
        {!value && <option value="">{placeholder}</option>}
        {(options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helperText}</p>}
    </div>
  );
};

export default Dropdown;
