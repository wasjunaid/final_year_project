import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import EndPoints from "../../constants/endpoints";
import api from "../../services/api";

const columns = [
  { key: "log_id", label: "ID" },
  {
    key: "person_name",
    label: "Person",
    render: (row: any) => `${row.first_name} ${row.last_name}`,
  },
  {
    key: "action",
    label: "Action",
    render: (row: any) => (
      <span className="w-xl inline-block max-w-[20rem] overflow-y-auto text-wrap whitespace-nowrap">
        {row.action}
      </span>
    ),
    maxWidth: "20rem",
  },
  {
    key: "created_at",
    label: "Time",
    render: (row: any) => new Date(row.created_at).toLocaleString(),
  },
];

// Filter buttons for common actions
const buttons = [
  { label: "All", value: "All" },
  { label: "Sign In", value: "sign in" },
  { label: "Sign Up", value: "sign up" },
  { label: "Profile Update", value: "update profile" },
  { label: "Document Upload", value: "upload document" },
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
        setLogs(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">System Logs</h2>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={logs}
          buttons={buttons}
          searchable={true}
          searchPlaceholder="Search logs..."
          defaultFilter="All"
          filterKey="action"
        />
      )}
    </div>
  );
}

export default LogsPage;
