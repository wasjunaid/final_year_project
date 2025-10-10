import InputField, { type IInputFieldProps } from "./InputField";

export interface ILabeledInputFieldProps extends IInputFieldProps {
  title: string; // title text
  required?: boolean; // optional: show * if required
  hint?: string; // optional: small text below field
  error?: string; // optional: error message below field (takes priority over hint)
}

function LabeledInputField({
  title: label,
  required,
  hint,
  error,
  ...rest
}: ILabeledInputFieldProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <InputField
        {...rest}
        className={`${rest.className || ""} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        }`}
      />

      {/* Error message (takes priority over hint) */}
      {error && (
        <span className="text-xs text-red-600 font-medium">{error}</span>
      )}

      {/* Hint text (only show if no error) */}
      {!error && hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}

export default LabeledInputField;
