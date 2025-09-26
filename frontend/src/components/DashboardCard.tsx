import { type ReactNode } from "react";

interface IDashboardInfoCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

function DashboardInfoCard({ icon, label, value }: IDashboardInfoCardProps) {
  return (
    <div className="p-4 bg-white rounded-md shadow-sm flex flex-col gap-2 border border-gray-200">
      {/* Icon box */}
      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-green-100 text-green-600 text-xl">
        {icon}
      </div>

      {/* Label */}
      <p className="text-gray-600 text-sm font-medium">{label}</p>

      {/* Value */}
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default DashboardInfoCard;
