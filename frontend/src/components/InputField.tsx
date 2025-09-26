import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface IInputFieldProps extends InputProps, TextAreaProps {
  icon?: ReactNode;
  multiline?: boolean;
}

function InputField({
  onChange,
  placeholder,
  disabled,
  multiline = false,
  rows = 3,
  icon,
  ...rest
}: IInputFieldProps) {
  const baseClasses =
    "w-full py-2 px-3 rounded-md text-black placeholder-gray-500" +
    "focus:outline-none focus:ring-2 focus:ring-primary " +
    (disabled ? "bg-grayColor cursor-not-allowed opacity-70" : "bg-grayColor");

  if (multiline) {
    return (
      <textarea
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...rest}
        className={baseClasses}
      />
    );
  }

  return (
    <div className="relative w-full">
      {icon && (
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
          {icon}
        </span>
      )}
      <input
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
        className={`${baseClasses} ${icon ? "pl-10" : ""}`}
      />
    </div>
  );
}

export default InputField;
