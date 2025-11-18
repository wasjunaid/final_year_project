import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import { useEHRAccess } from "../../hooks/useEHRAccess";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";

function CreateEHRAccessRequestPage() {
  const navigate = useNavigate();
  const role = useUserRole();
  const {
    loading,
    error,
    success,
    requestByDoctor,
    clearMessages
  } = useEHRAccess();

  // Form state
  const [patientId, setPatientId] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [message, setMessage] = useState("");

  const isDoctor = role === ROLES.DOCTOR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!patientId.trim()) {
      return;
    }

    try {
      const requestSuccess = await requestByDoctor({ 
        patient_id: parseInt(patientId),
        // patient_email: patientEmail || undefined,
        message: message || undefined 
      });
      
      if (requestSuccess) {
        // Clear form and navigate back after success
        setTimeout(() => {
          setPatientId("");
          setPatientEmail("");
          setMessage("");
          navigate(-1);
        }, 1500);
      }
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
          <h2 className="text-2xl font-bold mb-6">Request EHR Access</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <LabeledInputField
              title="Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter the patient's ID"
              type="number"
              required
              hint="Enter the ID of the patient whose EHR you want to access"
            />

            <LabeledInputField
              title="Patient Email (Optional)"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="Enter the patient's email address"
              type="email"
              hint="Optional: Enter the patient's email for reference"
            />

            <LabeledInputField
              title="Message (Optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for the patient..."
              multiline
              rows={4}
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

              <div className="flex gap-4">
                <Button
                  label={loading ? "Sending Request..." : "Send Request"}
                  icon={<FaPaperPlane />}
                  type="submit"
                  disabled={loading || !patientId.trim()}
                />
                <Button
                  label="Cancel"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  disabled={loading}
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