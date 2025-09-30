import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import api from "../../services/api";

const columns = [
  { key: "appointment_request_id", label: "Request ID" },
  { key: "hospital_name", label: "Hospital" },
  { key: "doctor_first_name", label: "Doctor First Name" },
  { key: "doctor_last_name", label: "Doctor Last Name" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "reason", label: "Reason" },
  { key: "status", label: "Status" },
];

function AppointmentRequestsPage() {
  const role = useUserRole();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      let endpoint = "";
      if (role === ROLES.PATIENT)
        endpoint = EndPoints.appointments.request.patient;
      else if (role === ROLES.HOSPITAL)
        endpoint = EndPoints.appointments.request.hospital;
      else {
        setError("Role not supported for appointment requests");
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(endpoint);
        setData(res.data.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load appointment requests"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [role]);

  return (
    <div className="flex h-screen justify-center">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={data}
          searchable={true}
          // You can add onRowClick if you want to show details
        />
      )}
    </div>
  );
}

export default AppointmentRequestsPage;
