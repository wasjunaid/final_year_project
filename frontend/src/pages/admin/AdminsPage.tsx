import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { FaUserPlus, FaTrash } from "react-icons/fa";

function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(EndPoints.systemAdmin.getAll);
      setAdmins(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (adminId: number) => {
    if (!window.confirm("Are you sure you want to remove this admin?")) {
      return;
    }

    try {
      await api.delete(`${EndPoints.systemAdmin.delete}/${adminId}`);
      // Refresh the list
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete admin");
    }
  };

  const handleCreateAdmin = () => {
    // TODO: Implement create admin functionality
    // Either navigate to create page or show modal
  };

  const columns = [
    { key: "system_admin_id", label: "ID" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "created_at",
      label: "Created At",
      render: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.system_admin_id);
          }}
          className="text-red-500 hover:text-red-700"
        >
          <FaTrash />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">System Administrators</h2>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={admins} searchable={true} />
      )}

      {!loading && admins.length === 0 && (
        <div className="text-gray-500 text-center mt-4">
          No administrators found.
        </div>
      )}
    </div>
  );
}

export default AdminsPage;
