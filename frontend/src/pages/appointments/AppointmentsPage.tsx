import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import api from "../../services/api";
import { type Appointment } from "../../models/Appointment";
import StatusCodes from "../../constants/StatusCodes";

const columns = [
  {
    key: "doctor",
    label: "Doctor",
    render: (row: Appointment) =>
      `${row.doctor_first_name} ${row.doctor_last_name}`,
  },
  {
    key: "hospital",
    label: "Hospital",
    render: (row: Appointment) => row.hospital_name,
  },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "reason", label: "Reason" },
  {
    key: "status",
    label: "Status",
    render: (row: Appointment) => {
      const colorMap: Record<string, string> = {
        upcoming: "text-yellow-500",
        "in progress": "text-blue-500",
        completed: "text-green-500",
        cancelled: "text-red-500",
      };
      return <span className={colorMap[row.status] || ""}>{row.status}</span>;
    },
  },
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
      let endpoint = "";

      if (role === ROLES.PATIENT) {
        endpoint = EndPoints.appointments.patient;
      } else if (role === ROLES.DOCTOR) {
        endpoint = EndPoints.appointments.doctor;
      } else if (
        role === ROLES.HOSPITAL_ADMIN ||
        role === ROLES.HOSPITAL_SUB_ADMIN ||
        role === ROLES.HOSPITAL_FRONT_DESK
      ) {
        endpoint = EndPoints.appointments.hospital;
      } else {
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
    <div className="flex h-full justify-center">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={data}
          searchable={true}
          onRowClick={(row) =>
            navigate(`/appointments/${row.appointment_id}`, { state: row })
          }
        />
      )}
    </div>
  );
}

export default AppointmentsPage;
