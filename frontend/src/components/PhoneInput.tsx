import React from 'react';

interface PhoneInputProps {
  label: string;
  value: string; // Format: "+92-3001234567" or just "3001234567"
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  required?: boolean;
  minWidth?: string;
  maxWidth?: string;
  containerClassName?: string;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+92', country: 'PK', flag: '🇵🇰' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+966', country: 'SA', flag: '🇸🇦' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  error,
  placeholder = '3001234567',
  required = false,
  minWidth,
  maxWidth,
  containerClassName = '',
}) => {
  const widthStyles = minWidth || maxWidth ? {
    minWidth: minWidth,
    maxWidth: maxWidth,
  } : undefined;
  
  // Parse the value to extract country code and number
  const parseValue = (val: string): { countryCode: string; number: string } => {
    if (!val) return { countryCode: '+92', number: '' };
    
    // If value contains a hyphen, split it
    if (val.includes('-')) {
      const [code, num] = val.split('-');
      return { countryCode: code || '+92', number: num || '' };
    }
    
    // If value starts with +, find where the number starts
    if (val.startsWith('+')) {
      // Try to match against known country codes
      for (const cc of COUNTRY_CODES) {
        if (val.startsWith(cc.code)) {
          return {
            countryCode: cc.code,
            number: val.substring(cc.code.length),
          };
        }
      }
    }
    
    // Default: treat entire value as number
    return { countryCode: '+92', number: val };
  };

  const { countryCode, number } = parseValue(value);

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    onChange(`${newCode}-${number}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, ''); // Only digits
    onChange(`${countryCode}-${newNumber}`);
  };

  return (
    <div className={`${containerClassName}`} style={widthStyles}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-[#e5e5e5] mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <select
          value={countryCode}
          onChange={handleCountryCodeChange}
          disabled={disabled}
          className="w-24 pr-8 p-2.5 md:p-3 border border-gray-300 dark:border-[#404040] rounded-lg 
                   bg-white dark:bg-[#3a3a3a] 
                   text-gray-800 dark:text-[#e5e5e5] 
                   focus:ring-2 focus:ring-primary focus:border-transparent 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   outline-none text-sm md:text-base"
        >
          {COUNTRY_CODES.map((cc) => (
            <option key={cc.code} value={cc.code}>
              {cc.flag} {cc.code}
            </option>
          ))}
        </select>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 p-2.5 md:p-3 border border-gray-300 dark:border-[#404040] rounded-lg 
                   bg-white dark:bg-[#3a3a3a] 
                   text-gray-800 dark:text-[#e5e5e5] 
                   placeholder-gray-400 dark:placeholder-[#707070]
                   focus:ring-2 focus:ring-primary focus:border-transparent 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   outline-none text-sm md:text-base"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
