import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  className?: string;
}

function Button({
  label,
  icon,
  onClick,
  className = "",
  ...rest
}: IButtonProps) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className={`inline-flex items-center gap-2 py-1 px-4 rounded-full 
        transition-colors duration-200 bg-primary text-white ${className}`}
    >
      {icon && (
        <span className="flex items-center text-lg text-white">{icon}</span>
      )}
      <span>{label}</span>
    </button>
  );
}

export default Button;
