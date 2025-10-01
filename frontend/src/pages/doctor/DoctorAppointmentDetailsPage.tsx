import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function DoctorAppointmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctorNote, setDoctorNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`${EndPoints.appointments.getDetails}${id}`);
        const appointmentData = res.data.data;
        setAppointment(appointmentData);
        setDoctorNote(appointmentData.doctor_note || "");
      } catch (err: any) {
        setError(
          err.response?.data?.message || 
          "Failed to load appointment details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await api.put(`${EndPoints.appointments.update}${id}`, {
        status: newStatus,
        doctor_note: doctorNote
      });
      setSuccess("Appointment status updated successfully!");
      setAppointment(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!appointment) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Appointment Details</h2>
        <Button 
          label="Back" 
          onClick={() => navigate(-1)} 
          variant="secondary"
        />
      </div>

      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Patient Name"
          value={`${appointment.patient_first_name || ""} ${
            appointment.patient_last_name || ""
          }`}
          disabled
        />
        <LabeledInputField
          title="Patient Email"
          value={appointment.patient_email}
          disabled
        />
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Hospital"
          value={appointment.hospital_name || "N/A"}
          disabled
        />
        <LabeledInputField
          title="Address"
          value={appointment.hospital_address || "N/A"}
          disabled
        />
      </div>

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
          className={STATUS_COLORS[appointment.status as keyof typeof STATUS_COLORS] || "text-gray-500"}
          disabled
        />
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Cost"
          value={`$${appointment.cost}`}
          disabled
        />
        <div className="w-full"></div>
      </div>

      {/* Doctor's Note Section */}
      <div className="mt-4">
        <LabeledInputField
          title="Doctor's Note"
          value={doctorNote}
          onChange={(e) => setDoctorNote(e.target.value)}
          multiline
          rows={4}
          disabled={appointment.status === "completed" || appointment.status === "cancelled"}
        />
      </div>

      {/* Action Buttons */}
      {appointment.status === "upcoming" && (
        <div className="flex gap-4 mt-4">
          <Button
            label="Start Appointment"
            onClick={() => handleStatusUpdate("in progress")}
          />
          <Button
            label="Cancel"
            onClick={() => handleStatusUpdate("cancelled")}
            variant="danger"
          />
        </div>
      )}

      {appointment.status === "in progress" && (
        <div className="flex gap-4 mt-4">
          <Button
            label="Complete Appointment"
            onClick={() => handleStatusUpdate("completed")}
            disabled={!doctorNote}
          />
        </div>
      )}
    </div>
  );
}

export default DoctorAppointmentDetailsPage;