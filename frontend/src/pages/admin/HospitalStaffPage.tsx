import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import EndPoints from "../../constants/endpoints";
import api from "../../services/api";

function HospitalStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all hospital staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(EndPoints.admin.allHospitals);
        setStaff(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load staff");
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleDelete = async (staffId: number) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) {
      return;
    }

    try {
      await api.delete(`${EndPoints.hospitalStaff.delete}/${staffId}`);
      setStaff(staff.filter((s) => s.hospital_staff_id !== staffId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete staff member");
    }
  };

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
