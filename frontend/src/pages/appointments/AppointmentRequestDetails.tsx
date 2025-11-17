import React, { useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES, type UserRole } from "../../constants/roles";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import NavBar from "../../components/NavBar";
import { useAppointment } from "../../hooks/useAppointment";
import { useDoctor } from "../../hooks/useDoctor";
import {
  type Appointment,
  type StatusType as AppointmentStatusType,
} from "../../models/Appointment";
import type { IDropdownOption } from "../../components/DropDownField";

const AppointmentRequestDetails = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useUserRole();

  const request: Appointment | null = location.state ?? null;

  // Hooks for API operations
  const { 
    loading: appointmentLoading, 
    error: appointmentError, 
    success: appointmentSuccess,
    approveAppointment,
    denyAppointment,
    cancelByPatient,
    rescheduleByPatient,
    // rescheduleByHospital,
    clearMessages: clearAppointmentMessages
  } = useAppointment();

  const { 
    doctors, 
    // loading: doctorsLoading,
    error: doctorsError,
    getHospitalAssociatedDoctors
  } = useDoctor();

  // Local state
  const [selectedDoctor, setSelectedDoctor] = useState(
    request?.doctor_id?.toString() || ""
  );
  const [date, setDate] = useState(request?.date || "");
  const [time, setTime] = useState(request?.time || "");
  const [cost, setCost] = useState(request?.total_cost?.toString() || "");

  // Memoized helper functions
  const isHospitalStaff = useCallback((): boolean => {
    return [
      ROLES.HOSPITAL_ADMIN,
      ROLES.HOSPITAL_SUB_ADMIN,
      ROLES.HOSPITAL_FRONT_DESK,
    ].includes(role as any);
  }, [role]);

  // Memoized doctor options
  const doctorOptions = useMemo((): IDropdownOption[] => {
    if (!doctors) return [];
    
    return doctors.map((doc: any) => ({
      label: doc.first_name && doc.last_name
        ? `${doc.first_name} ${doc.last_name}`
        : doc.email || "",
      value: doc.doctor_id.toString(),
    }));
  }, [doctors]);

  // Memoized status color helper
  const getStatusColor = useCallback((status: AppointmentStatusType): string => {
    switch (status) {
      case "APPROVED":
        return "text-green-500";
      case "PENDING":
      case "PROCESSING":
        return "text-yellow-500";
      case "CANCELLED":
      case "DENIED":
        return "text-red-500";
      case "COMPLETED":
        return "text-blue-500";
      case "IN PROGRESS":
        return "text-purple-500";
      case "RESCHEDULED":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  }, []);

  // Memoized action buttons
  const getActionButtons = useCallback((role?: UserRole): ReactNode => {
    const handleUpdateStatus = async (newStatus: AppointmentStatusType) => {
      if (!request) return;

      try {
        clearAppointmentMessages();
        
        if (isHospitalStaff()) {
          // Hospital staff actions
          if (newStatus === "APPROVED") {
            if (!cost || parseFloat(cost) <= 0) {
              alert("Please enter a valid appointment cost");
              return;
            }
            if (!selectedDoctor) {
              alert("Please select a doctor");
              return;
            }
            if (!date || !time) {
              alert("Please select date and time");
              return;
            }
            
            await approveAppointment(request.appointment_id, {
              doctor_id: parseInt(selectedDoctor),
              date: date,
              time: time,
              appointment_cost: parseFloat(cost)
            });
            
            // Only navigate on success
            setTimeout(() => navigate(-1), 1500);
          } else if (newStatus === "DENIED") {
            await denyAppointment(request.appointment_id);
            
            // Only navigate on success
            setTimeout(() => navigate(-1), 1500);
          }
        } else {
          // Patient actions
          if (newStatus === "CANCELLED") {
            await cancelByPatient(request.appointment_id);
            
            // Only navigate on success
            setTimeout(() => navigate(-1), 1500);
          } else if (newStatus === "RESCHEDULED") {
            if (!date || !time) {
              alert("Please select date and time");
              return;
            }
            
            await rescheduleByPatient(request.appointment_id, {
              appointment_id: request.appointment_id,
              date,
              time,
              reason: request.reason,
            });
            
            // Only navigate on success
            setTimeout(() => navigate(-1), 1500);
          }
        }
      } catch (err) {
        // Error handled by hook - DO NOT NAVIGATE
        console.error('Error updating appointment:', err);
      }
    };

    switch (role) {
      case ROLES.HOSPITAL_ADMIN:
      case ROLES.HOSPITAL_SUB_ADMIN:
      case ROLES.HOSPITAL_FRONT_DESK:
        return (
          <>
            <Button
              label="Approve"
              onClick={() => handleUpdateStatus("APPROVED")}
              disabled={appointmentLoading || !cost || !selectedDoctor || !date || !time}
            />
            <Button
              label="Deny"
              onClick={() => handleUpdateStatus("DENIED")}
              disabled={appointmentLoading}
            />
          </>
        );
      case ROLES.PATIENT:
        return (
          <>
            <Button
              label="Reschedule"
              onClick={() => handleUpdateStatus("RESCHEDULED")}
              disabled={appointmentLoading}
            />
            <Button
              label="Cancel"
              onClick={() => handleUpdateStatus("CANCELLED")}
              disabled={appointmentLoading}
            />
          </>
        );
      default:
        return null;
    }
  }, [
    request, 
    isHospitalStaff, 
    cost, 
    selectedDoctor, 
    date, 
    time, 
    appointmentLoading,
    approveAppointment,
    denyAppointment,
    cancelByPatient,
    rescheduleByPatient,
    clearAppointmentMessages,
    navigate
  ]);

  // Fetch doctors for hospital staff
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!request || !isHospitalStaff() || !request.hospital_id) {
        return;
      }

      try {
        await getHospitalAssociatedDoctors();
      } catch (err) {
        // Error handled by hook
      }
    };

    fetchDoctors();
  }, [request, isHospitalStaff, getHospitalAssociatedDoctors]);

  // Clear messages after success
  useEffect(() => {
    if (appointmentSuccess) {
      const timer = setTimeout(() => {
        clearAppointmentMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appointmentSuccess, clearAppointmentMessages]);

  // Show loading if fetching doctors
  // const isLoading = appointmentLoading || doctorsLoading;
  const error = appointmentError || doctorsError;
  const success = appointmentSuccess;

  if (!request)
    return (
      <div className="p-6 text-red-500">Appointment request not found</div>
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
          Appointment Details # {request.appointment_id}
        </h1>

        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}

        {/* Patient Information */}
        <div className="flex justify-between gap-10">
          <LabeledInputField
            title="Patient Name"
            value={request.patient_name || "N/A"}
            disabled
          />
          <LabeledInputField
            title="Patient ID"
            value={request.patient_id?.toString() || "N/A"}
            disabled
          />
        </div>

        {/* Doctor Information */}
        <div className="flex justify-between gap-10">
          {isHospitalStaff() &&
          (request.status === "PROCESSING" || request.status === "PENDING") ? (
            <LabeledDropDownField
              label="Select Doctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              options={doctorOptions}
              placeholder="Select a doctor"
              required
            />
          ) : (
            <LabeledInputField
              title="Doctor Name"
              value={request.doctor_name || "N/A"}
              disabled
            />
          )}
          <LabeledInputField
            title="Doctor ID"
            value={request.doctor_id?.toString() || "N/A"}
            disabled
          />
        </div>

        {/* Hospital Information */}
        {request.hospital_name && (
          <div className="flex justify-between gap-10">
            <LabeledInputField
              title="Hospital"
              value={request.hospital_name}
              disabled
            />
            {/* <LabeledInputField
              title="Address"
              value={request.hospital_address || "N/A"}
              disabled
            /> */}
          </div>
        )}

        {/* Appointment Details */}
        <div className="flex justify-between gap-10">
          {isHospitalStaff() &&
          (request.status === "PROCESSING" || request.status === "PENDING") ? (
            <>
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
            </>
          ) : !isHospitalStaff() &&
            (request.status === "PROCESSING" || request.status === "PENDING") ? (
            <>
              <LabeledInputField
                title="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <LabeledInputField
                title="Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </>
          ) : (
            <>
              <LabeledInputField
                title="Date"
                value={new Date(request.date).toLocaleDateString()}
                disabled
              />
              <LabeledInputField
                title="Time"
                value={request.time.substring(0, 5)}
                disabled
              />
            </>
          )}
        </div>

        <div className="flex justify-between gap-10">
          <LabeledInputField
            title="Status"
            value={request.status}
            className={getStatusColor(request.status)}
            disabled
          />
          {isHospitalStaff() && (request.status === "PROCESSING" || request.status === "PENDING") ? (
            <LabeledInputField
              title="Appointment Cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
              placeholder="Enter appointment cost"
            />
          ) : request.total_cost ? (
            <LabeledInputField
              title="Cost"
              value={`$${request.total_cost}`}
              disabled
            />
          ) : (
            <div className="w-full" />
          )}
        </div>

        <LabeledInputField
          title="Reason"
          value={request.reason}
          multiline
          rows={4}
          disabled
        />

        {/* Action Buttons */}
        {(request.status === "PROCESSING" || request.status === "PENDING") && (
          <div className="flex justify-end mt-2 gap-2">
            {getActionButtons(role!)}
          </div>
        )}
      </div>
    </div>
  );
});

AppointmentRequestDetails.displayName = 'AppointmentRequestDetails';

export default AppointmentRequestDetails;
