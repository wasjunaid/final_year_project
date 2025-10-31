import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useEHRAccess } from "../../hooks/useEHRAccess";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";

function CreateEHRAccessRequestPage() {
  const role = useUserRole();
  const {
    loading,
    error,
    success,
    requestByDoctor,
    clearMessages
  } = useEHRAccess();

  // Form state
  const [patientEmail, setPatientEmail] = useState("");
  const [message, setMessage] = useState("");

  const isDoctor = role === ROLES.DOCTOR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!patientEmail.trim()) {
      return;
    }

    try {
      // For now, we'll need to find the patient ID based on email
      // This might need to be implemented in the backend or through a separate API call
      // For the demo, I'll show how the hook would be used once the patient_id is available
      
      // Temporary placeholder - in real implementation you'd:
      // 1. Call an API to get patient by email
      // 2. Extract the patient_id
      // 3. Use that patient_id in the request
      
      // Example: const patient = await getPatientByEmail(patientEmail);
      // await requestByDoctor({ patient_id: patient.patient_id, message });
      
      console.log("Would request access for patient email:", patientEmail);
      setPatientEmail(""); // Clear form on success
      setMessage("");
      
    } catch (err: any) {
      // Error handling is managed by the hook
      console.error("Request failed:", err);
    }
  };

  if (!isDoctor) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only doctors can create EHR access requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Messages */}
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

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex justify-between items-center">
          <span>{success}</span>
          <button 
            onClick={clearMessages}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <LabeledInputField
              title="Patient Email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="Enter the patient's email address"
              type="email"
              required
              hint="Enter the Email of the patient whose EHR you want to access"
            />

            <LabeledInputField
              title="Message (Optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for the patient..."
              hint="Optional message to explain why you need access to their EHR"
            />

            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">
                  Request Information
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The patient will receive your access request</li>
                  <li>• They can approve or deny your request</li>
                  <li>
                    • Once approved, you'll have access to their complete EHR
                  </li>
                  <li>• Patients can revoke access at any time</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This feature requires backend implementation to convert patient email to patient ID. 
                  Currently set up to use the useEHRAccess hook once the patient lookup functionality is implemented.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  label={loading ? "Sending Request..." : "Send Request"}
                  icon={<FaPaperPlane />}
                  type="submit"
                  disabled={loading || !patientEmail.trim()}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEHRAccessRequestPage;