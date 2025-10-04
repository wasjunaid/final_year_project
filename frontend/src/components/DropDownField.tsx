import { type SelectHTMLAttributes, type ReactNode } from "react";

export interface IDropdownOption {
  label: string;
  value: any;
}

interface IDropDownFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: IDropdownOption[];
  icon?: ReactNode;
  placeholder?: string;
  value?: string; // controlled value
  defaultValue?: string; // fallback if controlled not provided
  className?: string;
}

function DropDownField({
  options,
  icon,
  placeholder = "Select an option",
  disabled,
  value,
  defaultValue,
  onChange,
  className = "",
  ...rest
}: IDropDownFieldProps) {
  const baseClasses =
    `${className} w-full py-2 px-3 rounded-md text-black` +
    "focus:outline-none focus:ring-2 focus:ring-primary " +
    (disabled ? "bg-gray-200 cursor-not-allowed opacity-70" : "bg-grayColor");

  return (
    <div className={`relative w-full`}>
      {/* Icon (inside, left) */}
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
          {icon}
        </span>
      )}

      {/* Select box */}
      <select
        onChange={onChange}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue ?? ""}
        {...rest}
        className={`${baseClasses} appearance-none pr-8 ${
          icon ? "pl-10" : "pl-3"
        }`}
      >
        {/* Placeholder (only visible if no value) */}
        <option value="" disabled hidden>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Dropdown Arrow (inside, right) */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
        ▼
      </span>
    </div>
  );
}

export default DropDownField;
