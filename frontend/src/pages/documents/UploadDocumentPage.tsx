import { useState } from "react";
import { FaUpload, FaFileAlt, FaTimes } from "react-icons/fa";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";

const documentTypes = [
  { value: "personal", label: "Personal Document" },
  { value: "lab test", label: "Lab Test" },
  { value: "prescription", label: "Prescription" },
];

function UploadDocumentPage() {
  const role = useUserRole();

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [detail, setDetail] = useState("");
  const [uploadedFor, setUploadedFor] = useState(""); // For doctors uploading for patients
  const [appointmentId, setAppointmentId] = useState(""); // For appointment-related uploads
  const [labTestId, setLabTestId] = useState(""); // For lab test uploads
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canUploadForOthers =
    role === ROLES.DOCTOR ||
    role === ROLES.HOSPITAL_ADMIN ||
    role === ROLES.HOSPITAL_SUB_ADMIN;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type (only PDF)
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }
      // Validate file size (100MB max)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!documentType) {
      setError("Please select a document type");
      return;
    }

    if (!detail.trim()) {
      setError("Please provide document details");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      formData.append("detail", detail);

      // Add optional fields for doctors/hospital staff
      if (uploadedFor && canUploadForOthers) {
        formData.append("uploaded_for", uploadedFor);
      }
      if (appointmentId) {
        formData.append("appointment_id", appointmentId);
      }
      if (labTestId) {
        formData.append("lab_test_id", labTestId);
      }

      await api.post(EndPoints.documents.upload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Document uploaded successfully!");

      // Clear form
      setFile(null);
      setDocumentType("");
      setDetail("");
      setUploadedFor("");
      setAppointmentId("");
      setLabTestId("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <p className="text-gray-600 text-sm">
          {role === ROLES.PATIENT
            ? "Upload your personal documents and medical records"
            : "Upload documents for patients or medical records"}
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File (PDF only, max 100MB)
          </label>

          {!file ? (
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <FaUpload className="mx-auto text-3xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Click to select a file or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PDF files only, up to 100MB
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaFileAlt className="text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Document Type */}
        <div className="flex gap-4">
          <LabeledDropDownField
            label="Document Type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            options={documentTypes}
            placeholder="Select document type"
            required
          />
          <div className="w-full"></div>
        </div>

        {/* Document Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Details
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Describe the document contents, purpose, or any relevant information..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Advanced Options for Doctors/Hospital Staff */}
        {canUploadForOthers && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">Advanced Options</h3>

            <LabeledInputField
              title="Upload for Patient ID (optional)"
              value={uploadedFor}
              onChange={(e) => setUploadedFor(e.target.value)}
              placeholder="Enter patient ID if uploading for another person"
              type="number"
            />

            <LabeledInputField
              title="Appointment ID (optional)"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              placeholder="Link to specific appointment"
              type="number"
            />

            <LabeledInputField
              title="Lab Test ID (optional)"
              value={labTestId}
              onChange={(e) => setLabTestId(e.target.value)}
              placeholder="Link to specific lab test"
              type="number"
            />
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            label={loading ? "Uploading..." : "Upload Document"}
            type="submit"
            disabled={loading || !file || !documentType || !detail.trim()}
          />
        </div>
      </form>
    </div>
  );
}

export default UploadDocumentPage;
