// CreateEHRAccessRequestPage.jsx (Email-only Version)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaEnvelope } from "react-icons/fa";
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
    clearMessages,
  } = useEHRAccess();

  const [patientEmail, setPatientEmail] = useState("");
  const [message, setMessage] = useState("");

  const isDoctor = role === ROLES.DOCTOR;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!patientEmail.trim()) return;

    try {
      const requestSuccess = await requestByDoctor({
        patient_email: patientEmail.trim(),
        message: message || undefined,
      });

      if (requestSuccess) {
        setTimeout(() => {
          setPatientEmail("");
          setMessage("");
          navigate(-1);
        }, 1500);
      }
    } catch (err) {
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
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearMessages} className="text-sm underline hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex justify-between items-center">
          <span>{success}</span>
          <button onClick={clearMessages} className="text-sm underline hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Request EHR Access</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <LabeledInputField
              title="Patient Email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="Enter the patient's email address"
              type="email"
              required
              icon={<FaEnvelope />}
              hint="Enter the patient's email to request EHR access"
            />

            <LabeledInputField
              title="Message (Optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for the patient..."
              multiline
              rows={4}
              hint="Optional message to explain why you need access"
            />

            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Request Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The patient will receive your access request</li>
                  <li>• They can approve or deny your request</li>
                  <li>• Once approved, you'll have access to their full EHR</li>
                  <li>• Patients can revoke access at any time</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  label={loading ? "Sending Request..." : "Send Request"}
                  icon={<FaPaperPlane />}
                  type="submit"
                  disabled={loading || !patientEmail.trim()}
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


// // LabeledInputField.jsx (Supports multiline + fix)
// import React from "react";

// const LabeledInputField = ({ title, value, onChange, placeholder, type, required, icon, hint, multiline, rows }) => {
//   return (
//     <div className="flex flex-col gap-1">
//       <label className="font-medium text-gray-700">{title}</label>

//       <div className="relative">
//         {icon && <span className="absolute left-3 top-3 text-gray-400">{icon}</span>}

//         {multiline ? (
//           <textarea
//             value={value}
//             onChange={(e) => onChange(e)}
//             rows={rows || 3}
//             placeholder={placeholder}
//             className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//         ) : (
//           <input
//             type={type}
//             value={value}
//             onChange={(e) => onChange(e)}
//             placeholder={placeholder}
//             required={required}
//             className="w-full border rounded-md p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//         )}
//       </div>

//       {hint && <p className="text-xs text-gray-500">{hint}</p>}
//     </div>
//   );
// };

// export default LabeledInputField;