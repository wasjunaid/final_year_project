import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, {
  type IDataTableColumnProps,
} from "../../components/DataTable";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES, type UserRole } from "../../constants/roles";
import api from "../../services/api";
import {
  AppointmentStatus,
  type Appointment,
  type AppointmentStatusType,
} from "../../models/Appointment";
import StatusCodes from "../../constants/StatusCodes";
import ROUTES from "../../constants/routes";

const getEndpoint = (role?: UserRole): string | null => {
  switch (role) {
    case ROLES.PATIENT:
      return EndPoints.appointments.patient;
    case ROLES.DOCTOR:
      return EndPoints.appointments.doctor;
    case ROLES.HOSPITAL_ADMIN:
    case ROLES.HOSPITAL_SUB_ADMIN:
    case ROLES.HOSPITAL_FRONT_DESK:
      return EndPoints.appointments.hospital;
    default:
      return null;
  }
};

const getStatusColor = (status: AppointmentStatusType): string => {
  switch (status) {
    case AppointmentStatus.upcoming:
      return "text-blue-500";
    case AppointmentStatus.completed:
      return "text-green-500";
    case AppointmentStatus.cancelled:
      return "text-red-500";
    case AppointmentStatus.inProgress:
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
};

// Patient columns (show doctor info)
const patientColumns = [
  {
    key: "doctor",
    label: "Doctor",
    render: (row: Appointment) =>
      `${row.doctor_first_name || ""} ${row.doctor_last_name || ""}`.trim() ||
      row.doctor_email,
  },
  { key: "hospital_name", label: "hospital" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "reason", label: "Reason" },
  {
    key: "status",
    label: "Status",
    render: (row: Appointment) => {
      return <span className={getStatusColor(row.status)}>{row.status}</span>;
    },
  },
];

// Doctor columns (show patient info)
const doctorColumns = [
  {
    key: "patient",
    label: "Patient",
    render: (row: Appointment) =>
      `${row.patient_first_name || ""} ${row.patient_last_name || ""}`.trim() ||
      row.patient_email,
  },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "reason", label: "Reason" },
  {
    key: "status",
    label: "Status",
    render: (row: Appointment) => {
      return <span className={getStatusColor(row.status)}>{row.status}</span>;
    },
  },
];

// Hospital/Front desk columns (show both patient and doctor, no hospital)
const hospitalColumns = [
  {
    key: "patient",
    label: "Patient",
    render: (row: Appointment) =>
      `${row.patient_first_name || ""} ${row.patient_last_name || ""}`.trim() ||
      row.patient_email,
  },
  {
    key: "doctor",
    label: "Doctor",
    render: (row: Appointment) =>
      `${row.doctor_first_name || ""} ${row.doctor_last_name || ""}`.trim() ||
      row.doctor_email,
  },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "reason", label: "Reason" },
  {
    key: "status",
    label: "Status",
    render: (row: Appointment) => {
      return <span className={getStatusColor(row.status)}>{row.status}</span>;
    },
  },
];

// Get columns based on user role
const getColumns = (role?: UserRole): IDataTableColumnProps<Appointment>[] => {
  switch (role) {
    case ROLES.PATIENT:
      return patientColumns;
    case ROLES.DOCTOR:
      return doctorColumns;
    case ROLES.HOSPITAL_ADMIN:
    case ROLES.HOSPITAL_SUB_ADMIN:
    case ROLES.HOSPITAL_FRONT_DESK:
      return hospitalColumns;
    default:
      return patientColumns;
  }
};

const buttons = [
  { label: "All", value: "All" },
  { label: "Upcoming", value: "upcoming" },
  { label: "In progress", value: "in progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function AppointmentsPage() {
  const role = useUserRole();
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError("");

      const endpoint = getEndpoint(role);
      if (!endpoint) {
        setError("Role not supported for appointments");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(endpoint);
        setData(res.data.data || []);
      } catch (err: any) {
        if (err.response?.status == StatusCodes.NOT_FOUND) {
          setData([]);
        } else {
          setError(
            err.response?.data?.message || "Failed to load appointments"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [role]);

  return (
    <div className="flex justify-center">
      {loading && (
        <div className="flex justify-center items-center">Loading...</div>
      )}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <DataTable
          columns={getColumns(role)}
          data={data}
          buttons={buttons}
          searchable={true}
          onRowClick={(row) =>
            navigate(ROUTES.APPOINTMENT_DETAIL, { state: row })
          }
        />
      )}
    </div>
  );
}

export default AppointmentsPage;
