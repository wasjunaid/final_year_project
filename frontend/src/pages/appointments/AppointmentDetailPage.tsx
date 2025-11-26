import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type Appointment } from "../../models/Appointment";
import LabeledInputField from "../../components/LabeledInputField";
import NavBar from "../../components/NavBar";
import { useUserRole } from "../../hooks/useUserRole";
import { useAppointment } from "../../hooks/useAppointment";
import { ROLES, type UserRole } from "../../constants/roles";
import Button from "../../components/Button";

// Medical details interface for appointment
interface MedicalDetails {
  appointmentDuration: string;
  historyOfPresentIllness: string;
  allergies: string;
  currentMedications: string;
  socialHistory: string;
  medicalHistory: string;
  surgicalHistory: string;
  familyHistory: string;
  reviewOfSystems: string;
  physicalExam: string;
  diagnoses: string;
  plan: string;
}

const AppointmentDetailsPage = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useUserRole();

  const appointment: Appointment | null = location.state ?? null;

  const [doctorNote, setDoctorNote] = useState("");
  const [medicalDetails, setMedicalDetails] = useState<MedicalDetails>({
    appointmentDuration: "",
    historyOfPresentIllness: "",
    allergies: "",
    currentMedications: "",
    socialHistory: "",
    medicalHistory: "",
    surgicalHistory: "",
    familyHistory: "",
    reviewOfSystems: "",
    physicalExam: "",
    diagnoses: "",
    plan: "",
  });
  
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
      case 'UPCOMING':
        return "text-blue-500";
      case 'IN PROGRESS':
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

  // Medical details change handler
  const handleMedicalDetailChange = useCallback((field: keyof MedicalDetails) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setMedicalDetails(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }, []
  );

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
        alert("Please enter doctor's note before completing the appointment");
        return;
      }

      const appointmentId = appointment.appointment_id;

      switch (newStatus) {
        case 'IN PROGRESS':
          await startByDoctor(appointmentId);
          // Only navigate on success
          setTimeout(() => navigate(-1), 1500);
          break;
        case 'COMPLETED':
          // TODO: Pass medicalDetails along with doctor_note to completeByDoctor
          await completeByDoctor(appointmentId, doctorNote);
          // Only navigate on success
          setTimeout(() => navigate(-1), 1500);
          break;
        case 'CANCELLED':
          await cancelByPatient(appointmentId);
          // Only navigate on success
          setTimeout(() => navigate(-1), 1500);
          break;
        default:
          break;
      }
    } catch (err) {
      // Error handled by hook - DO NOT NAVIGATE
      console.error('Error updating appointment:', err);
    }
  }, [appointment, role, doctorNote, medicalDetails, clearMessages, startByDoctor, completeByDoctor, cancelByPatient, navigate]);

  // Memoized role-based buttons
  const getRoleButtons = useCallback((userRole?: UserRole | null, status?: Appointment['status']) => {
    if (!status || !appointment) return null;

    // Helper function to check if appointment is upcoming (today or future)
    const isUpcoming = (): boolean => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      
      appointmentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      return appointmentDate >= today;
    };

    switch (userRole) {
      case ROLES.PATIENT:
        if (status === 'APPROVED' || status === 'UPCOMING') {
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
        if ((status === 'APPROVED' || status === 'UPCOMING') && isUpcoming()) {
          return (
            <>
              <Button
                label="Start Appointment"
                onClick={() => handleStatusUpdate('IN PROGRESS')}
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
        if (status === 'IN PROGRESS') {
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
        if (status === 'APPROVED' || status === 'UPCOMING') {
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
  }, [handleStatusUpdate, loading, doctorNote, appointment]);

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

  // Medical Details Section - Shown during IN PROGRESS (editable) or COMPLETED (read-only)
  const medicalDetailsSection = useMemo(() => {
    if (!appointment) return null;

    const isInProgress = appointment.status === 'IN PROGRESS' && role === ROLES.DOCTOR;
    const isCompleted = appointment.status === 'COMPLETED';
    const canView = isInProgress || isCompleted;

    if (!canView) return null;

    return (
      <div className="mt-6 border-t pt-6">
        <h2 className="text-lg font-bold mb-4 text-blue-600">Medical Documentation</h2>
        
        {/* Appointment Duration */}
        <div className="mb-4">
          <LabeledInputField
            title="Appointment Duration"
            value={medicalDetails.appointmentDuration}
            onChange={handleMedicalDetailChange('appointmentDuration')}
            placeholder="e.g., 30 minutes"
            disabled={!isInProgress}
          />
        </div>

        {/* History of Present Illness */}
        <div className="mb-4">
          <LabeledInputField
            title="History of Present Illness (HPI)"
            value={medicalDetails.historyOfPresentIllness}
            onChange={handleMedicalDetailChange('historyOfPresentIllness')}
            placeholder="Summary of patient's current condition, symptoms onset, duration, severity, and progression..."
            multiline
            rows={4}
            disabled={!isInProgress}
          />
        </div>

        {/* Patient History Section */}
        <h3 className="text-md font-semibold mb-3 mt-6 text-gray-700">Patient History</h3>
        
        <div className="mb-4">
          <LabeledInputField
            title="Allergies"
            value={medicalDetails.allergies}
            onChange={handleMedicalDetailChange('allergies')}
            placeholder="List all known allergies (medications, foods, environmental). Use 'NKDA' if none."
            multiline
            rows={2}
            disabled={!isInProgress}
          />
        </div>

        <div className="mb-4">
          <LabeledInputField
            title="Current Medications"
            value={medicalDetails.currentMedications}
            onChange={handleMedicalDetailChange('currentMedications')}
            placeholder="List all current medications with dosages and frequency..."
            multiline
            rows={3}
            disabled={!isInProgress}
          />
        </div>

        <div className="mb-4">
          <LabeledInputField
            title="Social History"
            value={medicalDetails.socialHistory}
            onChange={handleMedicalDetailChange('socialHistory')}
            placeholder="Smoking status, alcohol use, drug use, occupation, living situation..."
            multiline
            rows={3}
            disabled={!isInProgress}
          />
        </div>

        <div className="mb-4">
          <LabeledInputField
            title="Medical History"
            value={medicalDetails.medicalHistory}
            onChange={handleMedicalDetailChange('medicalHistory')}
            placeholder="Past medical conditions, chronic illnesses, significant past diagnoses..."
            multiline
            rows={3}
            disabled={!isInProgress}
          />
        </div>

        <div className="mb-4">
          <LabeledInputField
            title="Surgical History"
            value={medicalDetails.surgicalHistory}
            onChange={handleMedicalDetailChange('surgicalHistory')}
            placeholder="Previous surgical procedures with dates and outcomes..."
            multiline
            rows={2}
            disabled={!isInProgress}
          />
        </div>

        <div className="mb-4">
          <LabeledInputField
            title="Family History"
            value={medicalDetails.familyHistory}
            onChange={handleMedicalDetailChange('familyHistory')}
            placeholder="Hereditary conditions, family medical history (parents, siblings, grandparents)..."
            multiline
            rows={2}
            disabled={!isInProgress}
          />
        </div>

        {/* Clinical Assessment Section */}
        <h3 className="text-md font-semibold mb-3 mt-6 text-gray-700">Clinical Assessment</h3>

        <div className="mb-4">
          <LabeledInputField
            title="Review of Systems (ROS)"
            value={medicalDetails.reviewOfSystems}
            onChange={handleMedicalDetailChange('reviewOfSystems')}
            placeholder="Systematic review: Constitutional, Eyes, ENT, Cardiovascular, Respiratory, GI, GU, MSK, Skin, Neuro, Psychiatric, Endocrine, Heme/Lymph, Allergic/Immunologic..."
            multiline
            rows={5}
            disabled={!isInProgress}
          />
        </div>

        <div className="mb-4">
          <LabeledInputField
            title="Physical Exam"
            value={medicalDetails.physicalExam}
            onChange={handleMedicalDetailChange('physicalExam')}
            placeholder="Vital signs, general appearance, HEENT, cardiovascular, respiratory, abdominal, extremities, neurological findings..."
            multiline
            rows={5}
            disabled={!isInProgress}
          />
        </div>

        {/* Diagnoses and Plan Section */}
        <h3 className="text-md font-semibold mb-3 mt-6 text-gray-700">Assessment & Plan</h3>

        <div className="mb-4">
          <LabeledInputField
            title="Diagnoses"
            value={medicalDetails.diagnoses}
            onChange={handleMedicalDetailChange('diagnoses')}
            placeholder="List all diagnoses identified during this encounter with ICD codes if available..."
            multiline
            rows={3}
            disabled={!isInProgress}
          />
        </div>

        <div className="mb-4">
          <LabeledInputField
            title="Treatment Plan"
            value={medicalDetails.plan}
            onChange={handleMedicalDetailChange('plan')}
            placeholder="Treatment approach: medications prescribed, follow-up appointments, referrals, lab orders, patient education, lifestyle modifications..."
            multiline
            rows={5}
            disabled={!isInProgress}
          />
        </div>

        {isInProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> All medical documentation fields will be saved when you complete the appointment. 
              Please ensure all relevant information is documented before completing.
            </p>
          </div>
        )}
      </div>
    );
  }, [appointment, role, medicalDetails, handleMedicalDetailChange]);

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

      <div className="flex flex-col px-8 mt-4 gap-3 pb-8">
        <h1 className="text-xl font-bold">
          Appointment # {appointment.appointment_id}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

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

        {/* Doctor's Note Section - Only for doctors during IN PROGRESS */}
        {role === ROLES.DOCTOR && appointment.status === 'IN PROGRESS' && (
          <div className="mt-2">
            <LabeledInputField
              title="Doctor's Note (Required to Complete)"
              value={doctorNote}
              onChange={handleDoctorNoteChange}
              multiline
              rows={4}
              placeholder="Brief summary and key observations..."
            />
          </div>
        )}

        {/* Display existing doctor's note for completed appointments */}
        {appointment.doctor_note && appointment.status === 'COMPLETED' && (
          <LabeledInputField
            title="Doctor's Note"
            value={appointment.doctor_note}
            multiline
            rows={4}
            disabled
          />
        )}

        {/* Medical Details Section */}
        {medicalDetailsSection}

        {/* Action Buttons */}
        <div className="flex justify-end mt-6 gap-2">
          {getRoleButtons(role, appointment.status)}
        </div>
      </div>
    </div>
  );
});

AppointmentDetailsPage.displayName = 'AppointmentDetailsPage';

export default AppointmentDetailsPage;
