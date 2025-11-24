import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaArrowLeft } from "react-icons/fa";
import { useUserRole } from "../../hooks/useUserRole";
import { useDocument } from "../../hooks/useDocument";
import { ROLES } from "../../constants/roles";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";

// Valid document types for lab technicians (only lab test results)
const DOCUMENT_TYPES = {
  LAB_TEST: 'lab test',
} as const;

function UploadVerifiedDocumentPage() {
  const navigate = useNavigate();
  const role = useUserRole();
  const { loading, error, success, uploadVerified, clearMessages } = useDocument();

  const [documentType] = useState<string>(DOCUMENT_TYPES.LAB_TEST);
  const [detail, setDetail] = useState("");
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [labTestId, setLabTestId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const canUpload = role === ROLES.LAB_TECHNICIAN;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        clearMessages();
        alert("File size must be less than 10MB");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!patientId) {
      alert("Please enter the patient ID");
      return;
    }

    if (!appointmentId) {
      alert("Please enter the appointment ID");
      return;
    }

    if (!labTestId) {
      alert("Please enter the lab test ID");
      return;
    }

    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    if (!detail.trim()) {
      alert("Please provide details about the lab test results");
      return;
    }

    const uploadData = {
      file,
      document_type: documentType,
      detail: detail.trim(),
      uploaded_for: 'LAB_TEST' as const,
      patient_id: parseInt(patientId),
      appointment_id: parseInt(appointmentId),
      lab_test_id: parseInt(labTestId),
    };

    const success = await uploadVerified(uploadData);
    
    if (success) {
      // Clear form
      setDetail("");
      setPatientId("");
      setAppointmentId("");
      setLabTestId("");
      setFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Navigate back after 1.5 seconds
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    }
  };

  if (!canUpload) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only lab technicians can upload verified documents</p>
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
        <h1 className="text-2xl font-bold">Upload Lab Test Results</h1>
      </div>

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
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You are uploading a verified lab test result. This document will be immediately marked as verified and linked to the specified patient's appointment.
              </p>
            </div>

            <LabeledInputField
              title="Patient ID *"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID"
              type="number"
              required
              hint="The ID of the patient this lab test belongs to"
            />

            <LabeledInputField
              title="Appointment ID *"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              placeholder="Enter appointment ID"
              type="number"
              required
              hint="The appointment ID this lab test is associated with"
            />

            <LabeledInputField
              title="Lab Test ID *"
              value={labTestId}
              onChange={(e) => setLabTestId(e.target.value)}
              placeholder="Enter lab test ID"
              type="number"
              required
              hint="The specific lab test ID from your system"
            />

            <LabeledInputField
              title="Test Results & Details *"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Enter detailed information about the lab test results..."
              multiline
              rows={6}
              required
              hint="Provide comprehensive details about the test results, findings, and any relevant observations"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Test Results File *
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max: 10MB)
              </p>
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex gap-4">
                <Button
                  label={loading ? "Uploading..." : "Upload Verified Results"}
                  icon={<FaUpload />}
                  type="submit"
                  disabled={loading || !patientId || !appointmentId || !labTestId || !file || !detail.trim()}
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

export default UploadVerifiedDocumentPage;