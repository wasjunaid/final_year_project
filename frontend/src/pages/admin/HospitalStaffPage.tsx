import { useEffect } from "react";
import DataTable from "../../components/DataTable";
import { useHospitalStaff } from "../../hooks/useHospitalStaff";

function HospitalStaffPage() {
  const { 
    staff, 
    loading, 
    error, 
    success,
    getAllStaff, 
    deleteStaff,
    clearMessages 
  } = useHospitalStaff();

  // Fetch all hospital staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        await getAllStaff();
      } catch (err) {
        // Error handled by hook
      }
    };
    fetchStaff();
  }, [getAllStaff]);

  const handleDelete = async (staffId: number) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) {
      return;
    }

    try {
      await deleteStaff(staffId);
      // Refresh the list
      await getAllStaff();
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
    { key: "hospital_staff_id", label: "ID" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "hospital_name", label: "Hospital Name" },
    { key: "hospital_address", label: "Hospital Address" },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.hospital_staff_id);
          }}
          className="text-red-500 hover:text-red-700"
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

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

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

export default HospitalStaffPage;
