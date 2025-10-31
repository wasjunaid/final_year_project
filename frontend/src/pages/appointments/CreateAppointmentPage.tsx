import React, { useState, useEffect, useMemo, useCallback } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import { useAppointment } from "../../hooks/useAppointment";
import { useDoctor } from "../../hooks/useDoctor";
import { useHospital } from "../../hooks/useHospital";

const CreateAppointmentPage = React.memo(() => {
  // Basic form state
  const [hospitalId, setHospitalId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  // Hooks for API operations
  const { 
    loading: appointmentLoading, 
    success, 
    error, 
    createAppointment, 
    clearMessages 
  } = useAppointment();
  
  const { 
    doctors, 
    getDoctorsForAppointmentBooking 
  } = useDoctor();
  
  const { 
    hospitals, 
    getHospitals 
  } = useHospital();

  // Memoized hospital options
  const hospitalOptions = useMemo(() => {
    if (!hospitals || hospitals.length === 0) return [];
    
    return hospitals.map((h: any) => ({
      label: h.name,
      value: h.hospital_id,
    }));
  }, [hospitals]);

  // Memoized doctor options based on selected hospital
  const doctorOptions = useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    
    const filteredDoctors = doctors.filter((doctor: any) => {
      if (!hospitalId) return true; // Show all doctors if no hospital selected
      return doctor.hospital_id === parseInt(hospitalId);
    });
    
    return filteredDoctors.map((doctor: any) => ({
      value: doctor.doctor_id,
      label: `${doctor.email} ${
        doctor.specialization ? `(${doctor.specialization})` : ""
      } - ${doctor.hospital_name || "No Hospital"}`,
    }));
  }, [doctors, hospitalId]);

  // Memoized form validation
  const isFormValid = useMemo(() => {
    return !!(hospitalId && doctorId && date && time && reason);
  }, [hospitalId, doctorId, date, time, reason]);

  // Memoized handlers
  const handleHospitalChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setHospitalId(e.target.value);
    setDoctorId(""); // Reset doctor when hospital changes
  }, []);

  const handleDoctorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDoctorId(e.target.value);
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  }, []);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  }, []);

  const handleReasonChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReason(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    clearMessages();
    
    if (!isFormValid) {
      return;
    }

    try {
      await createAppointment({
        hospital_id: parseInt(hospitalId),
        doctor_id: parseInt(doctorId),
        date,
        time,
        reason,
      });

      // Reset form on success
      setHospitalId("");
      setDoctorId("");
      setDate("");
      setTime("");
      setReason("");
    } catch (err) {
      // Error handled by hook
    }
  }, [clearMessages, isFormValid, createAppointment, hospitalId, doctorId, date, time, reason]);

  // Fetch hospitals on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        await getHospitals();
      } catch (err) {
        // Error handled by hook
      }
    };
    fetchHospitals();
  }, [getHospitals]);

  // Fetch all doctors on mount
  useEffect(() => {
    const fetchAllDoctors = async () => {
      try {
        await getDoctorsForAppointmentBooking();
      } catch (err) {
        // Error handled by hook
      }
    };
    fetchAllDoctors();
  }, [getDoctorsForAppointmentBooking]);

  // Clear messages after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearMessages]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold mb-6">Create Appointment</h2>

      <div className="flex items-center justify-between gap-10">
        <LabeledDropDownField
          label="Select Hospital"
          value={hospitalId}
          onChange={handleHospitalChange}
          options={hospitalOptions}
          required
          placeholder="Choose a hospital"
        />
        <div className="w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledDropDownField
          label="Select Doctor"
          value={doctorId}
          onChange={handleDoctorChange}
          options={doctorOptions}
          disabled={appointmentLoading}
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
          onChange={handleDateChange}
          required
        />
        <LabeledInputField
          title="Time"
          type="time"
          value={time}
          onChange={handleTimeChange}
          required
        />
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Reason"
          multiline
          value={reason}
          onChange={handleReasonChange}
          required
        />
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      <div>
        <Button
          className="max-w-xs mt-4"
          label={appointmentLoading ? "Creating..." : "Create Appointment"}
          onClick={handleSubmit}
          disabled={appointmentLoading || !isFormValid}
        />
      </div>
    </div>
  );
});

CreateAppointmentPage.displayName = 'CreateAppointmentPage';

export default CreateAppointmentPage;
