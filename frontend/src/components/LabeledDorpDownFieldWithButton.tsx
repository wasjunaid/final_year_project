import { type ReactNode } from "react";
import DropDownField from "./DropDownField";
import Button from "./Button";

interface IDropdownOption {
  label: string;
  value: string;
}

interface ILabeledDropDownFieldWithButtonProps {
  label: string;
  options: IDropdownOption[];
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  className?: string; // extra styles for wrapper
  hint?: string;

  // Button props
  buttonLabel: string;
  buttonIcon?: ReactNode;
  onButtonClick: () => void;
  buttonSelected?: boolean;
}

function LabeledDropDownFieldWithButton({
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
  buttonLabel,
  buttonIcon,
  onButtonClick,
}: ILabeledDropDownFieldWithButtonProps) {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <DropDownField
            options={options}
            icon={icon}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={onChange}
          />
        </div>
        <Button label={buttonLabel} icon={buttonIcon} onClick={onButtonClick} />
      </div>

      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default LabeledDropDownFieldWithButton;
