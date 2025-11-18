import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaCalendar, FaVenusMars, FaTint } from "react-icons/fa";
import { useEHR } from "../../hooks/useEHR";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";

function EHRDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useUserRole();
  
  const { patient_id, patient_name, patient_email } = location.state || {};
  
  const {
    ehr,
    loading,
    error,
    getPatientEHR,
    getMyEHR,
    clearMessages
  } = useEHR();

  const isDoctor = role === ROLES.DOCTOR;
  const isPatient = role === ROLES.PATIENT;

  // Fetch EHR based on user role
  useEffect(() => {
    const fetchEHR = async () => {
      if (isDoctor && patient_id) {
        await getPatientEHR(patient_id);
      } else if (isPatient) {
        await getMyEHR();
      }
    };

    if (role) {
      fetchEHR();
    }
  }, [role, isDoctor, isPatient, patient_id, getPatientEHR, getMyEHR]);

  // Access check
  if (!role || (!isDoctor && !isPatient)) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Access Denied</p>
            <p>You don't have permission to view EHR</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading EHR...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold">
          {isDoctor ? `${patient_name || 'Patient'}'s EHR` : 'My EHR'}
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={clearMessages}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* EHR Content */}
      {ehr ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Patient Info Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FaUser className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{ehr.patient_name || patient_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendar className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {ehr.patient_date_of_birth 
                      ? new Date(ehr.patient_date_of_birth).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaVenusMars className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium">{ehr.patient_gender || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaTint className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Blood Group</p>
                  <p className="font-medium">{ehr.patient_blood_group || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* EHR Details */}
          <div className="p-6 space-y-6">
            <LabeledInputField
              title="Medical History"
              value={ehr.medical_history || 'No medical history recorded'}
              disabled
              multiline
              rows={3}
            />

            <LabeledInputField
              title="Allergies"
              value={ehr.allergies || 'No allergies recorded'}
              disabled
              multiline
              rows={2}
            />

            <LabeledInputField
              title="Current Medications"
              value={ehr.medications || 'No medications recorded'}
              disabled
              multiline
              rows={2}
            />

            <LabeledInputField
              title="Immunizations"
              value={ehr.immunizations || 'No immunizations recorded'}
              disabled
              multiline
              rows={2}
            />

            <LabeledInputField
              title="Lab Results"
              value={ehr.lab_results || 'No lab results recorded'}
              disabled
              multiline
              rows={3}
            />

            <LabeledInputField
              title="Family History"
              value={ehr.family_history || 'No family history recorded'}
              disabled
              multiline
              rows={2}
            />

            <LabeledInputField
              title="Social History"
              value={ehr.social_history || 'No social history recorded'}
              disabled
              multiline
              rows={2}
            />

            <LabeledInputField
              title="Vital Signs"
              value={ehr.vital_signs || 'No vital signs recorded'}
              disabled
              multiline
              rows={2}
            />

            <div className="border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-500">
                <p>Last Updated: {new Date(ehr.updated_at).toLocaleString()}</p>
                <p>Created: {new Date(ehr.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg mb-2">No EHR Found</p>
          <p className="text-sm">
            {isDoctor 
              ? "This patient's EHR is not available." 
              : "Your EHR has not been created yet."}
          </p>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <Button
          label="Back"
          variant="secondary"
          onClick={() => navigate(-1)}
        />
      </div>
    </div>
  );
}

export default EHRDetailsPage;