import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import api from "../../services/api";
import StatusCodes from "../../constants/StatusCodes";

// Columns for patient view (includes hospital name)
const patientColumns = [
  { key: "appointment_request_id", label: "Request ID" },
  {
    key: "hospital",
    label: "Hospital",
    render: (row: any) => row.hospital_name || `Hospital #${row.hospital_id}`,
  },
  {
    key: "doctor",
    label: "Doctor",
    render: (row: any) => {
      if (row.doctor_first_name && row.doctor_last_name) {
        return `${row.doctor_first_name} ${row.doctor_last_name}`;
      }
      return row.doctor_email || `Doctor #${row.doctor_id}`;
    },
  },
  {
    key: "date",
    label: "Date",
    render: (row: any) => new Date(row.date).toLocaleDateString(),
  },
  {
    key: "time",
    label: "Time",
    render: (row: any) => row.time.substring(0, 5), // Show only HH:MM
  },
  { key: "reason", label: "Reason" },
  {
    key: "status",
    label: "Status",
    render: (row: any) => (
      <span
        className={`${
          row.status === "active"
            ? "text-green-500"
            : row.status === "processing"
            ? "text-yellow-500"
            : "text-red-500"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

// Columns for hospital staff view (includes patient info)
const hospitalColumns = [
  { key: "appointment_request_id", label: "Request ID" },
  {
    key: "patient",
    label: "Patient",
    render: (row: any) => {
      if (row.patient_first_name && row.patient_last_name) {
        return `${row.patient_first_name} ${row.patient_last_name}`;
      }
      return row.patient_email || `Patient #${row.patient_id}`;
    },
  },
  {
    key: "doctor",
    label: "Doctor",
    render: (row: any) => {
      if (row.doctor_first_name && row.doctor_last_name) {
        return `${row.doctor_first_name} ${row.doctor_last_name}`;
      }
      return row.doctor_email || `Doctor #${row.doctor_id}`;
    },
  },
  {
    key: "date",
    label: "Date",
    render: (row: any) => new Date(row.date).toLocaleDateString(),
  },
  {
    key: "time",
    label: "Time",
    render: (row: any) => row.time.substring(0, 5),
  },
  { key: "reason", label: "Reason" },
  {
    key: "status",
    label: "Status",
    render: (row: any) => (
      <span
        className={`${
          row.status === "active"
            ? "text-green-500"
            : row.status === "processing"
            ? "text-yellow-500"
            : "text-red-500"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

function AppointmentRequestsPage() {
  const navigate = useNavigate(); // Add this
  const role = useUserRole();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      let endpoint = "";

      if (role === ROLES.PATIENT) {
        endpoint = EndPoints.appointments.request.patient;
      } else if (
        role === ROLES.HOSPITAL_ADMIN ||
        role === ROLES.HOSPITAL_SUB_ADMIN ||
        role === ROLES.HOSPITAL_FRONT_DESK
      ) {
        endpoint = EndPoints.appointments.request.hospital;
      } else {
        setError("Role not supported for appointment requests");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(endpoint);
        setData(res.data.data || []);
      } catch (err: any) {
        if (err.response?.status === StatusCodes.NOT_FOUND) {
          setData([]);
        } else {
          setError(
            err.response?.data?.message || "Failed to load appointment requests"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [role]);

  const handleRowClick = (row: any) => {
    navigate(`/appointments/requests/${row.appointment_request_id}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Appointment Requests</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable
          columns={role === ROLES.PATIENT ? patientColumns : hospitalColumns}
          data={data}
          searchable={true}
          onRowClick={handleRowClick} // Add this
        />
      )}

      {!loading && data.length === 0 && (
        <div className="text-gray-500 text-center mt-4">
          No appointment requests found.
        </div>
      )}
    </div>
  );
}

export default AppointmentRequestsPage;
