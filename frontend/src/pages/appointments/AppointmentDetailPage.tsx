import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type Appointment } from "../../models/Appointment";
import LabeledInputField from "../../components/LabeledInputField";
import NavBar from "../../components/NavBar";
import { useUserRole } from "../../hooks/useUserRole";
import { useAppointment } from "../../hooks/useAppointment";
import { ROLES, type UserRole } from "../../constants/roles";
import Button from "../../components/Button";

const AppointmentDetailsPage = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useUserRole();

  const appointment: Appointment | null = location.state ?? null;

  const [doctorNote, setDoctorNote] = useState("");
  
  const { 
    loading, 
    error, 
    success, 
    startByDoctor, 
    completeByDoctor, 
    cancelByPatient,
    clearMessages 
  } = useAppointment();

  // Memoized status color helper
  const getStatusColor = useCallback((status: Appointment['status']): string => {
    switch (status) {
      case 'APPROVED':
        return "text-blue-500";
      case 'IN_PROGRESS':
        return "text-yellow-500";
      case 'COMPLETED':
        return "text-green-500";
      case 'CANCELLED':
      case 'DENIED':
        return "text-red-500";
      case 'PROCESSING':
        return "text-orange-500";
      case 'RESCHEDULED':
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  }, []);

  // Memoized doctor note change handler
  const handleDoctorNoteChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDoctorNote(e.target.value);
  }, []);

  // Memoized status update handler
  const handleStatusUpdate = useCallback(async (newStatus: Appointment['status']) => {
    if (!appointment) return;

    try {
      clearMessages();
      
      // Validation based on role and status
      if (
        role === ROLES.DOCTOR &&
        newStatus === 'COMPLETED' &&
        !doctorNote
      ) {
        return;
      }

      const appointmentId = appointment.appointment_id;

      switch (newStatus) {
        case 'IN_PROGRESS':
          await startByDoctor(appointmentId);
          break;
        case 'COMPLETED':
          await completeByDoctor(appointmentId);
          break;
        case 'CANCELLED':
          await cancelByPatient(appointmentId);
          break;
        default:
          break;
      }

      // Navigate back after success
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      // Error handled by hook
    }
  }, [appointment, role, doctorNote, clearMessages, startByDoctor, completeByDoctor, cancelByPatient, navigate]);

  // Memoized role-based buttons
  const getRoleButtons = useCallback((userRole?: UserRole | null, status?: Appointment['status']) => {
    if (!status) return null;

    switch (userRole) {
      case ROLES.PATIENT:
        // Patient can only cancel approved appointments
        if (status === 'APPROVED') {
          return (
            <Button
              label="Cancel"
              onClick={() => handleStatusUpdate('CANCELLED')}
              variant="danger"
              disabled={loading}
            />
          );
        }
        return null;

      case ROLES.DOCTOR:
        // Doctor can start approved appointments and complete in-progress ones
        if (status === 'APPROVED') {
          return (
            <>
              <Button
                label="Start Appointment"
                onClick={() => handleStatusUpdate('IN_PROGRESS')}
                disabled={loading}
              />
              <Button
                label="Cancel"
                onClick={() => handleStatusUpdate('CANCELLED')}
                variant="danger"
                disabled={loading}
              />
            </>
          );
        }
        if (status === 'IN_PROGRESS') {
          return (
            <Button
              label="Complete Appointment"
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={loading || !doctorNote}
            />
          );
        }
        return null;

      case ROLES.HOSPITAL_ADMIN:
      case ROLES.HOSPITAL_SUB_ADMIN:
      case ROLES.HOSPITAL_FRONT_DESK:
        // Hospital staff can cancel approved appointments
        if (status === 'APPROVED') {
          return (
            <Button
              label="Cancel"
              onClick={() => handleStatusUpdate('CANCELLED')}
              variant="danger"
              disabled={loading}
            />
          );
        }
        return null;

      default:
        return null;
    }
  }, [handleStatusUpdate, loading, doctorNote]);

  // Memoized patient information section
  const patientInfoSection = useMemo(() => {
    if (role === ROLES.PATIENT || !appointment) return null;
    
    return (
      <div className="flex justify-between gap-10">
        <LabeledInputField
          title="Patient Name"
          value={appointment.patient_name || `Patient #${appointment.patient_id}`}
          disabled
        />
        <LabeledInputField
          title="Patient ID"
          value={appointment.patient_id.toString()}
          disabled
        />
      </div>
    );
  }, [role, appointment]);

  // Memoized doctor information section
  const doctorInfoSection = useMemo(() => {
    if (role === ROLES.DOCTOR || !appointment) return null;
    
    return (
      <div className="flex justify-between gap-10">
        <LabeledInputField
          title="Doctor Name"
          value={appointment.doctor_name || `Doctor #${appointment.doctor_id}`}
          disabled
        />
        <LabeledInputField
          title="Doctor ID"
          value={appointment.doctor_id.toString()}
          disabled
        />
      </div>
    );
  }, [role, appointment]);

  // Memoized hospital information section
  const hospitalInfoSection = useMemo(() => {
    if (role !== ROLES.PATIENT || !appointment) return null;
    
    return (
      <div className="flex justify-between gap-10">
        <LabeledInputField
          title="Hospital"
          value={appointment.hospital_name || `Hospital #${appointment.hospital_id}`}
          disabled
        />
        <LabeledInputField
          title="Hospital ID"
          value={appointment.hospital_id.toString()}
          disabled
        />
      </div>
    );
  }, [role, appointment]);

  // Clear messages after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearMessages]);

  if (!appointment)
    return (
      <div className="flex justify-center items-center h-screen p-6 text-red-500">
        404 Appointment Not Found
      </div>
    );

  return (
    <div className="flex flex-col w-full">
      <NavBar
        className="px-14"
        disableLeadingIcon
        hideNotifications
        onToggleSidebar={() => {}}
        onNotificationsClick={() => {}}
      />

      <div className="flex flex-col px-8 mt-4 gap-3">
        <h1 className="text-xl font-bold">
          Appointment # {appointment.appointment_id}
        </h1>

        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}

        {/* Patient Information */}
        {patientInfoSection}

        {/* Doctor Information */}
        {doctorInfoSection}

        {/* Hospital Information */}
        {hospitalInfoSection}

        {/* Appointment Details */}
        <div className="flex justify-between gap-10">
          <LabeledInputField
            title="Date"
            value={new Date(appointment.date).toLocaleDateString()}
            disabled
          />
          <LabeledInputField
            title="Time"
            value={appointment.time.substring(0, 5)}
            disabled
          />
        </div>

        <div className="flex justify-between items-center gap-10">
          <LabeledInputField
            title="Status"
            value={appointment.status}
            className={getStatusColor(appointment.status)}
            disabled
          />
          <LabeledInputField
            title="Total Cost"
            value={`$${appointment.total_cost}`}
            disabled
          />
        </div>

        {/* Reason */}
        <LabeledInputField
          title="Reason"
          value={appointment.reason}
          multiline
          rows={4}
          disabled
        />

        {/* Doctor's Note Section - Only for doctors */}
        {role === ROLES.DOCTOR &&
          appointment.status === 'IN_PROGRESS' && (
            <div className="mt-2">
              <LabeledInputField
                title="Doctor's Note (Required to Complete)"
                value={doctorNote}
                onChange={handleDoctorNoteChange}
                multiline
                rows={4}
                placeholder="Add medical notes and observations..."
              />
            </div>
          )}

        {/* Display existing doctor's note for completed appointments */}
        {appointment.doctor_note &&
          appointment.status === 'COMPLETED' && (
            <LabeledInputField
              title="Doctor's Note"
              value={appointment.doctor_note}
              multiline
              rows={4}
              disabled
            />
          )}

        {/* Action Buttons */}
        <div className="flex justify-end mt-2 gap-2">
          {getRoleButtons(role, appointment.status)}
        </div>
      </div>
    </div>
  );
});

AppointmentDetailsPage.displayName = 'AppointmentDetailsPage';

export default AppointmentDetailsPage;
