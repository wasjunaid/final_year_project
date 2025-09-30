import { useState } from "react";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import LabeledInputField from "../../components/LabeledInputField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";

function CreateAppointmentPage() {
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // TODO: Fetch hospital and doctor options from backend
  const hospitalOptions = [
    { label: "City Hospital", value: 1 },
    { label: "Green Valley Clinic", value: 2 },
    { label: "Community Health", value: 3 },
  ];

  const doctorOptions = [
    { label: "Dr. Smith", value: 1 },
    { label: "Dr. Adams", value: 2 },
    { label: "Dr. Lee", value: 3 },
  ];

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post(EndPoints.appointments.request.insert, {
        hospital_id: hospital,
        doctor_id: doctor,
        date,
        time,
        reason,
      });
      setSuccess("Appointment request sent!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Create Appointment</h2>
      <LabeledDropDownField
        label="Hospital"
        value={hospital}
        onChange={(e) => setHospital(e.target.value)}
        options={hospitalOptions}
      />
      <LabeledDropDownField
        label="Doctor"
        value={doctor}
        onChange={(e) => setDoctor(e.target.value)}
        options={doctorOptions}
      />
      <LabeledInputField
        title="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        type="date"
      />
      <LabeledInputField
        title="Time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        type="time"
      />
      <LabeledInputField
        title="Reason"
        multiline
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      <Button
        className="my-4"
        label={loading ? "Creating..." : "Create"}
        onClick={handleCreate}
        disabled={loading}
      />
    </div>
  );
}

export default CreateAppointmentPage;
