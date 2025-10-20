import { useEffect, useState } from "react";
import { FaHistory, FaUser, FaClock } from "react-icons/fa";
import DataTable from "../../components/DataTable";
import EndPoints from "../../constants/endpoints";
import api from "../../services/api";

// Helper function to extract action type from log message
const getActionType = (action: string): string => {
  if (action.includes("Sign In")) return "Sign In";
  if (action.includes("Sign Up")) return "Sign Up";
  if (action.includes("Updated person")) return "Profile Update";
  if (action.includes("upload document")) return "Document Upload";
  if (action.includes("created")) return "Create";
  if (action.includes("updated")) return "Update";
  if (action.includes("deleted")) return "Delete";
  return "Other";
};

// Helper function to format action message for better readability
const formatActionMessage = (action: string): string => {
  try {
    // Handle sign in/up messages
    if (action.includes("Sign In:") || action.includes("Sign Up:")) {
      return action;
    }

    // Handle update person messages
    if (action.includes("Updated person:")) {
      const parts = action.split("Updated person:");
      if (parts.length > 1) {
        try {
          const data = JSON.parse(parts[1].trim());
          const fields = Object.keys(data).join(", ");
          return `Updated profile fields: ${fields}`;
        } catch {
          return "Updated profile information";
        }
      }
    }

    return action;
  } catch {
    return action;
  }
};

// Helper function to get action badge color
const getActionBadgeColor = (actionType: string): string => {
  switch (actionType) {
    case "Sign In":
      return "bg-green-100 text-green-800";
    case "Sign Up":
      return "bg-blue-100 text-blue-800";
    case "Profile Update":
      return "bg-yellow-100 text-yellow-800";
    case "Document Upload":
      return "bg-purple-100 text-purple-800";
    case "Create":
      return "bg-emerald-100 text-emerald-800";
    case "Update":
      return "bg-orange-100 text-orange-800";
    case "Delete":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const columns = [
  {
    key: "log_id",
    label: "ID",
    render: (row: any) => (
      <span className="font-mono text-sm text-gray-600">#{row.log_id}</span>
    ),
  },
  {
    key: "person_name",
    label: "Person",
    render: (row: any) => {
      const firstName = row.first_name || "";
      const lastName = row.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();

      if (!fullName) {
        return (
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-400" />
            <span className="text-gray-500 italic">Unknown User</span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-400" />
          <span className="font-medium text-gray-900">{fullName}</span>
        </div>
      );
    },
  },
  {
    key: "action",
    label: "Action",
    render: (row: any) => {
      const actionType = getActionType(row.action);
      const formattedMessage = formatActionMessage(row.action);
      const badgeColor = getActionBadgeColor(actionType);

      return (
        <div className="space-y-1">
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}
          >
            {actionType}
          </span>
          <div className="text-sm text-gray-700 break-words max-w-md">
            {formattedMessage}
          </div>
        </div>
      );
    },
    maxWidth: "24rem",
  },
  {
    key: "created_at",
    label: "Time",
    render: (row: any) => (
      <div className="flex items-center gap-2">
        <FaClock className="text-gray-400" />
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(row.created_at).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(row.created_at).toLocaleTimeString()}
          </div>
        </div>
      </div>
    ),
  },
];

// Updated filter buttons with better matching
const buttons = [
  { label: "All Actions", value: "All" },
  { label: "Sign In", value: "Sign In" },
  { label: "Sign Up", value: "Sign Up" },
  { label: "Profile Updates", value: "Profile Update" },
  { label: "Document Uploads", value: "Document Upload" },
  // { label: "Create Actions", value: "Create" },
  // { label: "Update Actions", value: "Update" },
  // { label: "Delete Actions", value: "Delete" },
];

function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(EndPoints.logs);
        const logsData = res.data.data || [];

        // Add action_type for filtering
        const processedLogs = logsData.map((log: any) => ({
          ...log,
          action_type: getActionType(log.action),
        }));

        setLogs(processedLogs);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-full">
          <FaHistory className="text-indigo-600 text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            System Activity Logs
          </h1>
          <p className="text-sm text-gray-500">
            Track all user activities and system events
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading system logs...</div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && logs.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">
              {logs.length}
            </div>
            <div className="text-sm text-gray-500">Total Logs</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {
                logs.filter(
                  (log) => getActionType(log.action) === "Sign In"
                ).length
              }
            </div>
            <div className="text-sm text-gray-500">Sign Ins</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">
              {
                logs.filter(
                  (log) => getActionType(log.action) === "Sign Up"
                ).length
              }
            </div>
            <div className="text-sm text-gray-500">Sign Ups</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">
              {
                logs.filter(
                  (log) => getActionType(log.action) === "Profile Update"
                ).length
              }
            </div>
            <div className="text-sm text-gray-500">Profile Updates</div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow">
          <DataTable
            columns={columns}
            data={logs}
            buttons={buttons}
            searchable={true}
            searchPlaceholder="Search logs by person name or action..."
            defaultFilter="All"
            filterKey="action_type"
            // emptyMessage="No logs found matching your criteria."
          />
        </div>
      )}
    </div>
  );
}

export default LogsPage;
