import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

function Button({
  label,
  icon,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: IButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-primary text-white hover:bg-blue-700";
      case "secondary":
        return "bg-gray-500 text-white hover:bg-gray-600";
      case "danger":
        return "bg-red-500 text-white hover:bg-red-600";
      case "success":
        return "bg-green-500 text-white hover:bg-green-600";
      case "warning":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      default:
        return "bg-primary text-white hover:bg-blue-700";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "xs":
        return "text-xs px-2 py-0.5";
      case "sm":
        return "text-sm px-3 py-1";
      case "lg":
        return "text-base px-5 py-2";
      default:
        return "text-sm px-4 py-1.5"; // md
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "xs":
        return "text-sm";
      case "sm":
        return "text-base";
      case "lg":
        return "text-xl";
      default:
        return "text-lg"; // md
    }
  };

  return (
    <button
      onClick={onClick}
      {...rest}
      className={`inline-flex justify-center items-center gap-2 rounded-md 
        transition-colors duration-200 font-medium ${getVariantStyles()} ${getSizeStyles()} 
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon && (
        <span className={`flex items-center ${getIconSize()} text-white`}>
          {icon}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}

export default Button;
