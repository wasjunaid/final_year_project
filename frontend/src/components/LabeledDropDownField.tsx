import { type ReactNode } from "react";
import DropDownField, { type IDropdownOption } from "./DropDownField";

interface ILabeledDropDownFieldProps {
  label: string;
  options: IDropdownOption[];
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  className?: string;
  hint?: string;
}

function LabeledDropDownField({
  label,
  options,
  icon,
  placeholder,
  value,
  defaultValue,
  disabled,
  required,
  onChange,
  className = "",
  hint,
}: ILabeledDropDownFieldProps) {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <DropDownField
        options={options}
        icon={icon}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default LabeledDropDownField;
