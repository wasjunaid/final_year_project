import { useState, type DragEvent } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";

function UploadDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [detail, setDetail] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [labTestId, setLabTestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const { user } = useAuth();

  const documentTypes = [
    { label: "Personal", value: "personal" },
    { label: "Lab Test", value: "lab test" },
    { label: "Prescription", value: "prescription" },
  ];

  const allowedTypes = [".pdf"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    validateFile(selected);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateFile(droppedFile);
  };

  const validateFile = (selected?: File) => {
    if (selected) {
      const isValidType = allowedTypes.some((ext) =>
        selected.name.toLowerCase().endsWith(ext)
      );
      if (!isValidType) {
        setError(`Invalid file type. Only PDF is allowed.`);
        setFile(null);
        return;
      }
    }
    setError("");
    setFile(selected || null);
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (!file || !documentType || !detail) {
      setError("Please fill all required fields and select a file.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      formData.append("detail", detail);
      if (appointmentId) formData.append("appointment_id", appointmentId);
      if (labTestId) formData.append("lab_test_id", labTestId);

      if (user?.person_id) {
        formData.append("uploaded_for", user.person_id.toString());
      }

      const res = await api.post(EndPoints.documents.upload, formData);

      if (res.data.success) {
        setSuccess("Document uploaded successfully!");
        resetForm();
      } else {
        setError(res.data.message || "Failed to upload document.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setDocumentType("");
    setDetail("");
    setAppointmentId("");
    setLabTestId("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Upload Document</h2>

      {/* Document Type */}
      <LabeledDropDownField
        label="Document Type"
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value)}
        options={documentTypes}
      />

      {/* Detail */}
      <LabeledInputField
        title="Detail"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        multiline
        required
      />

      {/* File Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`mt-4 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer block">
          {file ? (
            <div className="text-gray-700">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">
                Drag and drop a file here, or{" "}
                <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported: {allowedTypes.join(", ")}
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Optional Fields */}
      {user?.role !== ROLES.PATIENT && (
        <>
          <LabeledInputField
            title="Appointment ID (optional)"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
          />
          <LabeledInputField
            title="Lab Test ID (optional)"
            value={labTestId}
            onChange={(e) => setLabTestId(e.target.value)}
          />
        </>
      )}

      {/* Messages */}
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      {/* Submit Button */}
      <div>
        <Button
          className="my-4"
          label={loading ? "Uploading..." : "Upload Document"}
          onClick={handleUpload}
          disabled={loading}
        />
      </div>
    </div>
  );
}

export default UploadDocument;
