import { type ReactNode } from "react";

export interface WarningCardProps {
  children: ReactNode;
  className?: string;
}

function WarningCard({ children, className = "" }: WarningCardProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 bg-yellow-50 border border-yellow-300 rounded-md ${className}`}
    >
      <div className="flex flex-col items-center gap-2">{children}</div>
    </div>
  );
}

export default WarningCard;
