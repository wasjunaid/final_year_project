import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
}

export interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  label?: React.ReactNode;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxVisibleOptions?: number;
  fullWidth?: boolean;
  minWidth?: string;
  maxWidth?: string;
  containerClassName?: string;
  labelClassName?: string;
  dropdownClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  searchable = false,
  searchPlaceholder = 'Search...',
  maxVisibleOptions = 5,
  fullWidth = false,
  minWidth,
  maxWidth,
  containerClassName = '',
  labelClassName = '',
  dropdownClassName = '',
  disabled,
  required,
  placeholder = 'Select an option',
  size = 'md',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => {
        const label = opt.label;  // extract label
        const labelStr = typeof label === 'string' ? label : '';  // consider only string labels for searching
        return (
          labelStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.value.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : options;

  const widthStyle = fullWidth ? 'w-full' : '';
  
  const widthStyles = !fullWidth && (minWidth || maxWidth) ? {
    minWidth: minWidth,
    maxWidth: maxWidth,
  } : undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Size-based padding styles
  const sizeStyles = {
    sm: 'p-2 text-sm',
    md: 'p-2.5 md:p-3 text-sm md:text-base',
    lg: 'p-3 md:p-4 text-base md:text-lg',
  };

  const baseDropdownStyles = `border border-gray-300 dark:border-[#404040] rounded-lg ${sizeStyles[size]} focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-[#2a2a2a] cursor-pointer bg-white dark:bg-[#3a3a3a] dark:text-[#e5e5e5]`;
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';

  return (
    <div ref={ref} className={`${widthStyle} ${containerClassName}`} style={widthStyles}>
      {label && (
        <label className={`block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2 ${labelClassName}`}>
          {label}
          {/* {required && <span className="text-red-500 ml-1">*</span>} */}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Selected Value Display */}
        <div
          className={`${baseDropdownStyles} ${errorStyles} ${widthStyle} ${dropdownClassName} flex items-center justify-between`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
        >
          <span className={
            disabled 
              ? 'text-gray-500 dark:text-dark-text' 
              : selectedOption 
                ? 'text-gray-900 dark:text-dark-text' 
                : 'text-gray-400 dark:text-gray-500'
          }>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={20} 
            className={`text-gray-400 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`absolute z-50 mt-1 w-full bg-white dark:bg-dark-bg-tertiary border border-gray-300 dark:border-dark-border rounded-lg shadow-lg overflow-hidden`}>
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-dark-border">
                <div className="relative">
                  {/* <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" /> */}
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-3 p-2.5 md:p-3 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base bg-white dark:bg-dark-bg-tertiary dark:text-dark-text"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div 
              className={filteredOptions.length > maxVisibleOptions ? "overflow-y-auto" : ""}
              style={filteredOptions.length > maxVisibleOptions ? { maxHeight: `${maxVisibleOptions * 2.5}rem` } : {}}
              role="listbox"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2.5 cursor-pointer transition-colors text-sm md:text-base ${
                      option.value === value
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-bg-secondary dark:text-dark-text'
                    }`}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2.5 text-gray-400 dark:text-gray-500 text-sm text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${props.id}-helper`} className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;
