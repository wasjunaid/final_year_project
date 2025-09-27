import { type ReactNode } from "react";
import InputField, { type IInputFieldProps } from "./InputField";

export interface ILabeledInputFieldProps extends IInputFieldProps {
  title: string; // title text
  required?: boolean; // optional: show * if required
  hint?: string; // optional: small text below field
}

function LabeledInputField({
  title: label,
  required,
  hint,
  ...rest
}: ILabeledInputFieldProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Field (forward all props) */}
      <InputField {...rest} />

      {/* Hint text */}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}

export default LabeledInputField;
