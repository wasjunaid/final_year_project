import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import Button from "../../components/Button";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import EndPoints from "../../constants/endpoints";
import api from "../../services/api";
import { FaUserPlus } from "react-icons/fa";
import ROUTES from "../../constants/routes";



function HospitalStaffPage() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Array<{ label: string; value: number }>>([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch hospitals on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get(EndPoints.hospital.get);
        const hospitalOptions = res.data.data.map((h: any) => ({
          label: h.name,
          value: h.hospital_id,
        }));
        setHospitals(hospitalOptions);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load hospitals");
      }
    };
    fetchHospitals();
  }, []);

  // Fetch staff when hospital is selected
  useEffect(() => {
    const fetchStaff = async () => {
      if (!selectedHospital) {
        setStaff([]);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await api.get(
          `${EndPoints.hospitalStaff.getAll}/${selectedHospital}`
        );
        setStaff(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load staff");
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [selectedHospital]);

  const handleAddStaff = () => {
    navigate(ROUTES.HOSPITAL_PORTAL + "/staff/create");
  };

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
  {
    key: "created_at",
    label: "Joined",
    render: (row: any) => new Date(row.created_at).toLocaleDateString(),
  },
  {
    key: "status",
    label: "Status",
    render: (row: any) => (
      <span
        className={`${
          row.is_verified ? "text-green-500" : "text-yellow-500"
        }`}
      >
        {row.is_verified ? "Verified" : "Pending"}
      </span>
    ),
  },
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

      <div className="mb-6">
        <LabeledDropDownField
          label="Select Hospital"
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
          options={hospitals}
          required
        />
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {selectedHospital ? (
        <>
          {loading && <div>Loading staff...</div>}
          {!loading && (
            <DataTable
              columns={columns}
              data={staff}
              searchable={true}
            />
          )}
          {!loading && staff.length === 0 && (
            <div className="text-gray-500">
              No staff members found for this hospital.
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-500">
          Please select a hospital to view its staff.
        </div>
      )}
    </div>
  );
}

export default HospitalStaffPage;
