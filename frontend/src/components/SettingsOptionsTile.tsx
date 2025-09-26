import React from "react";
import DropDownField, { type IDropdownOption } from "./DropDownField";

export interface ISettingsOptionsTileProps {
  label: string;
  required?: boolean;
  desc?: string;
  options: IDropdownOption[]; // pass dropdown options
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

function SettingsOptionsTile({
  label,
  required,
  desc,
  options,
  value,
  defaultValue,
  onChange,
}: ISettingsOptionsTileProps) {
  return (
    <div className="p-[16px] bg-grayColor rounded-sm w-full space-y-2">
      <label className="font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {desc && <p className="text-xs text-gray-500">{desc}</p>}

      <DropDownField
        options={options}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className="bg-white"
      />
    </div>
  );
}

export default SettingsOptionsTile;
