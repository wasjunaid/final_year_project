import { useEffect } from "react";
import DataTable from "../../components/DataTable";
import { useSystemAdmin } from "../../hooks/useSystemAdmin";
import { FaTrash } from "react-icons/fa";

function AdminsPage() {
  const { 
    systemAdmins, 
    loading, 
    error, 
    success,
    getAllSystemAdmins, 
    deleteSystemAdmin,
    clearMessages 
  } = useSystemAdmin();

  const fetchAdmins = async () => {
    try {
      await getAllSystemAdmins();
    } catch (err) {
      // Error handled by hook
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
      await deleteSystemAdmin(adminId);
      // Refresh the list
      await getAllSystemAdmins();
    } catch (err) {
      // Error handled by hook
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearMessages]);

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
      {success && <div className="text-green-500 mb-4">{success}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={systemAdmins} searchable={true} />
      )}

      {!loading && systemAdmins.length === 0 && (
        <div className="text-gray-500 text-center mt-4">
          No administrators found.
        </div>
      )}
    </div>
  );
}

export default AdminsPage;
