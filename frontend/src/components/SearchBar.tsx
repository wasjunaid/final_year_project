import { type InputHTMLAttributes, type ReactNode } from "react";
import { FiSearch } from "react-icons/fi";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export interface ISearchBarProps extends InputProps {
  icon?: ReactNode;
}

function SearchBar({
  onChange,
  placeholder = "Search...",
  disabled,
  icon,
  ...rest
}: ISearchBarProps) {
  const baseClasses =
    "w-full py-2 px-3 rounded-md text-black placeholder-gray-500 " +
    "focus:outline-none focus:ring-2 focus:ring-primary " +
    "border border-gray-300 shadow-sm " +
    (disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-transparent");

  return (
    <div className="relative w-full">
      <input
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
        className={baseClasses + " pr-10"}
      />
      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
        {icon || <FiSearch size={18} />}
      </span>
    </div>
  );
}

export default SearchBar;
