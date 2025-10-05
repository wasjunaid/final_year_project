import { useState, useEffect } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
// import type { Doctor } from "../../models/Doctor";

interface Hospital {
  hospital_id: number;
  name: string;
}

interface Doctor {
  doctor_id: number;
  email: string;
  hospital_id: number | null;
  hospital_name: string | null;
  specialization: string | null;
  status: string;
  // Add other fields as needed
}

function CreateAppointmentPage() {
  // Basic form state
  const [hospitalId, setHospitalId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  // Data loading state
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch hospitals on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get(EndPoints.hospital.get);
        const hospitalOptions = res.data.data.map((h: Hospital) => ({
          value: h.hospital_id,
          label: h.name,
        }));
        setHospitals(hospitalOptions);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load hospitals");
      }
    };
    fetchHospitals();
  }, []);

  // Fetch all doctors on mount
  useEffect(() => {
    const fetchAllDoctors = async () => {
      try {
        const res = await api.get(EndPoints.doctor.getAll);
        // Store the complete doctor objects
        setDoctors(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load doctors");
      }
    };
    fetchAllDoctors();
  }, []);

  // Filter doctors based on selected hospital
  const filteredDoctors = doctors
    .filter((doctor) => {
      if (!hospitalId) return true; // Show all doctors if no hospital selected
      return doctor.hospital_id === parseInt(hospitalId); // Use parseInt for string comparison
    })
    .map((doctor) => ({
      value: doctor.doctor_id,
      label: `${doctor.email} ${
        doctor.specialization ? `(${doctor.specialization})` : ""
      } - ${doctor.hospital_name || "No Hospital"}`,
    }));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!hospitalId || !doctorId || !date || !time || !reason) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(EndPoints.appointments.request.insert, {
        hospital_id: hospitalId,
        doctor_id: doctorId,
        date,
        time,
        reason,
      });

      if (res.data.success) {
        setSuccess("Appointment request created successfully!");
        // Reset form
        setHospitalId("");
        setDoctorId("");
        setDate("");
        setTime("");
        setReason("");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create appointment request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold mb-6">Create Appointment</h2>

      <div className="flex items-center justify-between gap-10">
        <LabeledDropDownField
          label="Select Hospital"
          value={hospitalId}
          onChange={(e) => {
            setHospitalId(e.target.value);
            setDoctorId(""); // Reset doctor when hospital changes
          }}
          options={hospitals.map((h) => ({
            value: h.hospital_id,
            label: h.name,
          }))}
          required
        />
        <div className="w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledDropDownField
          label="Select Doctor"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          options={filteredDoctors}
          disabled={loading}
          required
          placeholder={
            hospitalId
              ? "Select doctor from this hospital"
              : "Select any doctor"
          }
        />
        <div className="w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <LabeledInputField
          title="Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Reason"
          multiline
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      <div>
        <Button
          className="max-w-xs mt-4"
          label={loading ? "Creating..." : "Create Appointment"}
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>
    </div>
  );
}

export default CreateAppointmentPage;
