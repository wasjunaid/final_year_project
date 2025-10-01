import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import LabeledInputField from "../../components/LabeledInputField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import NavBar from "../../components/NavBar";
import { FaArrowLeft } from "react-icons/fa";
import { type Appointment } from "../../models/Appointment";

const STATUS_COLORS = {
  upcoming: "text-blue-500",
  "in progress": "text-yellow-500",
  completed: "text-green-500",
  cancelled: "text-red-500",
} as const;

function AppointmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useUserRole();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch appointment details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const endpoint =
          role === ROLES.PATIENT
            ? EndPoints.appointments.patient
            : EndPoints.appointments.hospital;

        const res = await api.get(endpoint);

        // Find the specific appointment
        const appointmentData = res.data.data.find(
          (apt: Appointment) => apt.appointment_id === parseInt(id || "")
        );

        if (!appointmentData) {
          throw new Error("Appointment not found");
        }

        // Set default values for missing fields
        setAppointment({
          ...appointmentData,
          hospital_name: appointmentData.hospital_name || "N/A",
          hospital_address: appointmentData.hospital_address || "N/A",
          patient_first_name: appointmentData.patient_first_name || "",
          patient_last_name: appointmentData.patient_last_name || "",
          patient_email: appointmentData.patient_email || "N/A",
          doctor_first_name: appointmentData.doctor_first_name || "",
          doctor_last_name: appointmentData.doctor_last_name || "",
          doctor_email: appointmentData.doctor_email || "N/A",
          cost: appointmentData.cost || "0",
          doctor_note: appointmentData.doctor_note || "",
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load appointment details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, role]);

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "text-gray-500";
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!appointment) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="w-full">
      <NavBar
        leadingIcon={<FaArrowLeft size={16} />}
        onLeadingIconClick={() => navigate(-1)}
        showNotifications={false}
        onToggleSidebar={() => {}}
        onNotificationsClick={() => {}}
      />

      <div className="p-8">
        <div className="flex flex-col gap-6 bg-white rounded-lg shadow-md p-6">
          {error && <div className="text-red-500">{error}</div>}

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold mb-6">Appointment Details</h2>

            {/* Patient Information */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Patient Information</h3>
              <div className="flex items-center justify-between gap-10">
                <LabeledInputField
                  title="Patient Name"
                  value={`${
                    appointment.patient_first_name || ""
                  } ${appointment.patient_last_name || ""}`}
                  disabled
                />
                <LabeledInputField
                  title="Patient Email"
                  value={appointment.patient_email}
                  disabled
                />
              </div>
            </div>

            {/* Doctor Information */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Doctor Information</h3>
              <div className="flex items-center justify-between gap-10">
                <LabeledInputField
                  title="Doctor Name"
                  value={`${
                    appointment.doctor_first_name || ""
                  } ${appointment.doctor_last_name || ""}`}
                  disabled
                />
                <LabeledInputField
                  title="Doctor Email"
                  value={appointment.doctor_email}
                  disabled
                />
              </div>
            </div>

            {/* Appointment Details */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Appointment Details</h3>
              <div className="flex items-center justify-between gap-10">
                <LabeledInputField
                  title="Date"
                  value={new Date(appointment.date).toLocaleDateString()}
                  disabled
                />
                <LabeledInputField
                  title="Time"
                  value={appointment.time}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between gap-10">
                <LabeledInputField
                  title="Reason"
                  value={appointment.reason}
                  disabled
                />
                <LabeledInputField
                  title="Status"
                  value={appointment.status}
                  className={getStatusColor(appointment.status)}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between gap-10">
                <LabeledInputField
                  title="Cost"
                  value={`$${appointment.cost}`}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetailsPage;
