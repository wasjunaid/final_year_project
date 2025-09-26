import React from "react";

export interface ISettingsToggleTileProps {
  label: string;
  required?: boolean;
  desc?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function SettingsToggleTile({
  label,
  required,
  desc,
  checked = false,
  disabled = false,
  onChange,
}: ISettingsToggleTileProps) {
  return (
    <div className="p-[16px] bg-grayColor rounded-sm w-full space-y-2 flex items-center justify-between">
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>

      {/* Toggle Switch */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-300 ${
            disabled
              ? "bg-gray-300 cursor-not-allowed"
              : "peer-checked:bg-primary bg-gray-400"
          }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white border transition-transform duration-300 ${
            checked ? "translate-x-5" : ""
          }`}
        ></div>
      </label>
    </div>
  );
}

export default SettingsToggleTile;
