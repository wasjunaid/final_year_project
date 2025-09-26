import { type ButtonHTMLAttributes, type ReactNode } from "react";

export interface ITabButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  className?: string;
}

function TabButton({
  label,
  icon,
  selected = true,
  onClick,
  className = "",
  ...rest
}: ITabButtonProps) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className={`inline-flex items-center gap-2 py-1 px-4 rounded-full transition-colors duration-200 shadow-sm
        ${selected ? "bg-primary text-white" : "bg-grayColor text-black"}
        ${className}
      `}
    >
      {icon && (
        <span
          className={`flex items-center text-lg
            ${selected ? "text-white" : "text-black"}
          `}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}

export default TabButton;
