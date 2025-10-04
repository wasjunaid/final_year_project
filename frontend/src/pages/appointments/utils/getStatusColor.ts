const STATUS_COLORS = {
  upcoming: "text-blue-500",
  completed: "text-green-500",
  cancelled: "text-red-500",
  "in progress": "text-yellow-500",
} as const;

const getStatusColor = (status: string) => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "text-gray-500";
};

export default getStatusColor;
