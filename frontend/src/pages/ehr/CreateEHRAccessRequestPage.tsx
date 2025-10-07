import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";

function CreateEHRAccessRequestPage() {
  const role = useUserRole();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Form state
  const [patientId, setPatientId] = useState("");

  const isDoctor = role === ROLES.DOCTOR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!patientId.trim()) {
      setError("Patient ID is required");
      return;
    }

    setLoading(true);

    try {
      await api.post(EndPoints.ehrAccessRequest.create, {
        patient_id: parseInt(patientId),
      });

      setSuccess("EHR access request sent successfully!");
      setPatientId(""); // Clear form on success
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
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
      <p>TODO: maybe change id to email</p>
      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <LabeledInputField
              title="Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter the patient's ID number"
              type="number"
              required
              hint="Enter the unique ID of the patient whose EHR you want to access"
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
                {/* <Button
                  label="Clear Form"
                  variant="secondary"
                  onClick={() => {
                    setPatientId("");
                    setError("");
                    setSuccess("");
                  }}
                  type="button"
                  disabled={loading}
                /> */}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEHRAccessRequestPage;
