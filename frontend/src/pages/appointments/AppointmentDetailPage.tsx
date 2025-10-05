import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  type Appointment,
  AppointmentStatus,
  type AppointmentStatusType,
} from "../../models/Appointment";
import LabeledInputField from "../../components/LabeledInputField";
import NavBar from "../../components/NavBar";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES, type UserRole } from "../../constants/roles";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";

function AppointmentDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useUserRole();

  const appointment: Appointment | null = location.state ?? null;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctorNote, setDoctorNote] = useState("");

  const getStatusColor = (status: AppointmentStatusType): string => {
    switch (status) {
      case AppointmentStatus.upcoming:
        return "text-blue-500";
      case AppointmentStatus.inProgress:
        return "text-yellow-500";
      case AppointmentStatus.completed:
        return "text-green-500";
      case AppointmentStatus.cancelled:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const handleStatusUpdate = async (newStatus: AppointmentStatusType) => {
    if (!appointment) return;

    try {
      // Validation based on role and status
      if (
        role === ROLES.DOCTOR &&
        newStatus === AppointmentStatus.completed &&
        !doctorNote
      ) {
        setError("Please add a doctor's note before completing");
        return;
      }

      await api.put(
        `${EndPoints.appointments.update}${appointment.appointment_id}`,
        {
          status: newStatus,
          doctor_note: doctorNote || undefined,
        }
      );

      setSuccess(`Appointment ${newStatus} successfully!`);
      setTimeout(() => navigate(-1), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update appointment");
    }
  };

  const getRoleButtons = (role?: UserRole, status?: AppointmentStatusType) => {
    if (!status) return null;

    switch (role) {
      case ROLES.PATIENT:
        // Patient can only cancel upcoming appointments
        if (status === AppointmentStatus.upcoming) {
          return (
            <Button
              label="Cancel"
              onClick={() => handleStatusUpdate(AppointmentStatus.cancelled)}
              variant="danger"
            />
          );
        }
        return null;

      case ROLES.DOCTOR:
        // Doctor can start upcoming appointments and complete in-progress ones
        if (status === AppointmentStatus.upcoming) {
          return (
            <>
              <Button
                label="Start Appointment"
                onClick={() => handleStatusUpdate(AppointmentStatus.inProgress)}
              />
              <Button
                label="Cancel"
                onClick={() => handleStatusUpdate(AppointmentStatus.cancelled)}
                variant="danger"
              />
            </>
          );
        }
        if (status === AppointmentStatus.inProgress) {
          return (
            <Button
              label="Complete Appointment"
              onClick={() => handleStatusUpdate(AppointmentStatus.completed)}
              disabled={!doctorNote}
            />
          );
        }
        return null;

      case ROLES.HOSPITAL_ADMIN:
      case ROLES.HOSPITAL_SUB_ADMIN:
      case ROLES.HOSPITAL_FRONT_DESK:
        // Hospital staff can cancel upcoming appointments
        if (status === AppointmentStatus.upcoming) {
          return (
            <Button
              label="Cancel"
              onClick={() => handleStatusUpdate(AppointmentStatus.cancelled)}
              variant="danger"
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

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
        {role !== ROLES.PATIENT && (
          <div className="flex justify-between gap-10">
            <LabeledInputField
              title="Patient Name"
              value={
                appointment.patient_first_name && appointment.patient_last_name
                  ? `${appointment.patient_first_name} ${appointment.patient_last_name}`
                  : appointment.patient_email
              }
              disabled
            />
            <LabeledInputField
              title="Patient Email"
              value={appointment.patient_email}
              disabled
            />
          </div>
        )}

        {/* Doctor Information */}
        {role !== ROLES.DOCTOR && (
          <div className="flex justify-between gap-10">
            <LabeledInputField
              title="Doctor Name"
              value={
                appointment.doctor_first_name && appointment.doctor_last_name
                  ? `${appointment.doctor_first_name} ${appointment.doctor_last_name}`
                  : appointment.doctor_email
              }
              disabled
            />
            <LabeledInputField
              title="Doctor Email"
              value={appointment.doctor_email}
              disabled
            />
          </div>
        )}

        {/* Hospital Information */}
        {role === ROLES.PATIENT && (
          <div className="flex justify-between gap-10">
            <LabeledInputField
              title="Hospital"
              value={appointment.hospital_name}
              disabled
            />
            <LabeledInputField
              title="Address"
              value={appointment.hospital_address || "N/A"}
              disabled
            />
          </div>
        )}

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
            title="Cost"
            value={`$${appointment.cost}`}
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
          appointment.status === AppointmentStatus.inProgress && (
            <div className="mt-2">
              <LabeledInputField
                title="Doctor's Note (Required to Complete)"
                value={doctorNote}
                onChange={(e) => setDoctorNote(e.target.value)}
                multiline
                rows={4}
                placeholder="Add medical notes and observations..."
              />
            </div>
          )}

        {/* Display existing doctor's note for completed appointments */}
        {appointment.doctor_note &&
          appointment.status === AppointmentStatus.completed && (
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
}

export default AppointmentDetailsPage;
