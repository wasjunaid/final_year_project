import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaArrowLeft } from "react-icons/fa";
import { useUserRole } from "../../hooks/useUserRole";
import { useDocument } from "../../hooks/useDocument";
import { ROLES } from "../../constants/roles";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";
import ROUTES from "../../constants/routes";

// Valid document types according to backend
const DOCUMENT_TYPES = {
  PERSONAL: 'personal',
  LAB_TEST: 'lab test',
  PRESCRIPTION: 'prescription',
} as const;

function UploadDocumentPage() {
  const navigate = useNavigate();
  const role = useUserRole();
  const { loading, error, success, uploadUnverified, clearMessages } = useDocument();

  const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES.PERSONAL);
  const [detail, setDetail] = useState("");
  const [uploadedFor, setUploadedFor] = useState<'SELF' | 'APPOINTMENT' | 'LAB_TEST'>('SELF');
  const [appointmentId, setAppointmentId] = useState("");
  const [labTestId, setLabTestId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const canUpload = role === ROLES.PATIENT;

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

    if (!documentType) {
      alert("Please select a document type");
      return;
    }

    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    const uploadData = {
      file,
      document_type: documentType,
      detail: detail || '',
      uploaded_for: uploadedFor,
      appointment_id: appointmentId ? parseInt(appointmentId) : undefined,
      lab_test_id: labTestId ? parseInt(labTestId) : undefined,
    };

    const success = await uploadUnverified(uploadData);
    
    if (success) {
      // Clear form
      setDocumentType(DOCUMENT_TYPES.PERSONAL);
      setDetail("");
      setUploadedFor('SELF');
      setAppointmentId("");
      setLabTestId("");
      setFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // // Navigate back after 1.5 seconds
      // setTimeout(() => {
      //   navigate(ROUTES.DOCUMENTS);
      // }, 1500);
    }
  };

  if (!canUpload) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only patients can upload documents</p>
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
        <h1 className="text-2xl font-bold">Upload Document</h1>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={DOCUMENT_TYPES.PERSONAL}>Personal Document</option>
                <option value={DOCUMENT_TYPES.LAB_TEST}>Lab Test</option>
                <option value={DOCUMENT_TYPES.PRESCRIPTION}>Prescription</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the type of document you're uploading
              </p>
            </div>

            <LabeledInputField
              title="Details"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Add any additional details..."
              multiline
              rows={4}
              hint="Provide details or notes about the document"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload For
              </label>
              <select
                value={uploadedFor}
                onChange={(e) => setUploadedFor(e.target.value as 'SELF' | 'APPOINTMENT' | 'LAB_TEST')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SELF">Personal Use</option>
                <option value="APPOINTMENT">Appointment Related</option>
                <option value="LAB_TEST">Lab Test Related</option>
              </select>
            </div>

            {uploadedFor === 'APPOINTMENT' && (
              <LabeledInputField
                title="Appointment ID (Optional)"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                placeholder="Enter appointment ID"
                type="number"
                hint="Link this document to a specific appointment"
              />
            )}

            {uploadedFor === 'LAB_TEST' && (
              <LabeledInputField
                title="Lab Test ID (Optional)"
                value={labTestId}
                onChange={(e) => setLabTestId(e.target.value)}
                placeholder="Enter lab test ID"
                type="number"
                hint="Link this document to a specific lab test"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document File *
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
                  label={loading ? "Uploading..." : "Upload Document"}
                  icon={<FaUpload />}
                  type="submit"
                  disabled={loading || !documentType || !file}
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

export default UploadDocumentPage;
