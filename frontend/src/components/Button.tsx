import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  className?: string;
}

function Button({
  label,
  icon,
  onClick,
  variant = "primary",
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

  return (
    <button
      onClick={onClick}
      {...rest}
      // className={`inline-flex justify-center items-center gap-2 py-1 px-4 rounded-full
      //   transition-colors duration-200 bg-primary text-white ${className}`}
      className={`inline-flex justify-center items-center gap-2 py-1 px-4 rounded-md 
        transition-colors duration-200 font-medium ${getVariantStyles()} 
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon && (
        <span className="flex items-center text-lg text-white">{icon}</span>
      )}
      <span>{label}</span>
    </button>
  );
}

export default Button;
