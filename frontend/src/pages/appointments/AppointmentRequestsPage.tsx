import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES, type UserRole } from "../../constants/roles";
import api from "../../services/api";
import StatusCodes from "../../constants/StatusCodes";
import ROUTES from "../../constants/routes";
import {
  AppointmentRequestStatus,
  type AppointmentRequest,
  type AppointmentRequestStatusType,
} from "../../models/AppointmentRequest";

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
    key: "appointment_status",
    label: "Status",
    maxWidth: "10rem",
    render: (row: any) => (
      <span className={`${getStatusColor(row.appointment_status)}`}>
        {row.appointment_status}
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
    key: "appointment_status",
    label: "Status",
    render: (row: any) => (
      <span className={`${getStatusColor(row.appointment_status)}`}>
        {row.appointment_status}
      </span>
    ),
  },
];

const buttons = [
  { label: "All", value: "All" },
  { label: "Approved", value: "approved" },
  { label: "Processing", value: "processing" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Denied", value: "denied" },
];

const getEndPoints = (role?: UserRole): string => {
  switch (role) {
    case ROLES.PATIENT:
      return EndPoints.appointments.request.patient;
    case ROLES.HOSPITAL_ADMIN:
    case ROLES.HOSPITAL_SUB_ADMIN:
    case ROLES.HOSPITAL_FRONT_DESK:
      return EndPoints.appointments.request.hospital;
    default:
      return "";
  }
};

const getStatusColor = (status: AppointmentRequestStatusType): string => {
  switch (status) {
    case AppointmentRequestStatus.approved:
      return "text-green-500";
    case AppointmentRequestStatus.processing:
      return "text-yellow-500";
    case AppointmentRequestStatus.cancelled:
    case AppointmentRequestStatus.denied:
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

function AppointmentRequestsPage() {
  const navigate = useNavigate();
  const role = useUserRole();
  const [data, setData] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");

      const endpoint = getEndPoints(role);
      if (!endpoint) {
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

  return (
    <div className="">
      {loading && (
        <div className="flex justify-center items-center">Loading...</div>
      )}

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {!loading && !error && (
        <DataTable
          buttons={buttons}
          defaultFilter="All"
          filterKey="appointment_status"
          columns={role === ROLES.PATIENT ? patientColumns : hospitalColumns}
          data={data}
          searchable={true}
          onRowClick={(row) =>
            navigate(ROUTES.APPOINTMENT_REQUEST_DETAILS, { state: row })
          }
        />
      )}
    </div>
  );
}

export default AppointmentRequestsPage;
