import { type ButtonHTMLAttributes, type ReactNode } from "react";

export interface ISideBarButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  collapsed?: boolean;
  className?: string;
}

function SideBarButton({
  label,
  icon,
  selected = false,
  collapsed = false,
  onClick,
  className = "",
  ...rest
}: ISideBarButtonProps) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className={`inline-flex items-center font-md transition-colors duration-200
        ${selected ? "bg-primary text-white" : "text-black"}
        ${
          collapsed
            ? "justify-center w-10 h-10 rounded-lg"
            : "gap-3 py-2 px-4 w-full rounded-lg"
        }
        ${className}
      `}
    >
      {icon && (
        <span
          className={`text-xl flex items-center
          ${selected ? "text-white" : "text-black"}
        `}
        >
          {icon}
        </span>
      )}
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

export default SideBarButton;
