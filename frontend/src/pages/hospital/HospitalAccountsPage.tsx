import { useEffect } from "react";
import DataTable from "../../components/DataTable";
import { useHospitalStaff } from "../../hooks/useHospitalStaff";
import type { HospitalStaff } from "../../models/HospitalStaff";

function HospitalAccountsPage() {
  const {
    staff,
    loading,
    error,
    success,
    getAllStaff,
    deleteStaff,
    clearMessages
  } = useHospitalStaff();

  useEffect(() => {
    getAllStaff();
  }, [getAllStaff]);

  const handleDelete = async (staffId: number) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) {
      return;
    }

    await deleteStaff(staffId);
  };

  const columns = [
    { key: "hospital_staff_id", label: "ID" },
    { 
      key: "person_email", 
      label: "Email",
      render: (row: HospitalStaff) => row.person_email || "N/A"
    },
    { key: "role", label: "Role" },
    {
      key: "created_at",
      label: "Joined",
      render: (row: HospitalStaff) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: HospitalStaff) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.hospital_staff_id);
          }}
          className="text-red-500 hover:text-red-700"
          disabled={loading}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hospital Staff</h2>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
          <button 
            onClick={clearMessages}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {success && (
        <div className="text-green-600 mb-4">
          {success}
          <button 
            onClick={clearMessages}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div>Loading staff...</div>
      ) : (
        <>
          <DataTable columns={columns} data={staff} searchable={true} />
          {staff.length === 0 && (
            <div className="text-gray-500 text-center mt-4">
              No staff members found.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HospitalAccountsPage;
