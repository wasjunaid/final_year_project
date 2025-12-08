import React from "react";
import { ROLES } from "../../../constants/profile";
import { useAuthController } from "../../../hooks/auth";
import { FileUploadZone } from "../../../components/FileUploadZone";
import TextInput from "../../../components/TextInput";
import { useDocumentController } from "../../../hooks/document";
import Alert from "../../../components/Alert";

export const UploadVerifiedDocument: React.FC = () => {
  // verify role so it can't accidentally be used in unauthorized portals
  const {role} = useAuthController();
  if (
    role !== ROLES.HOSPITAL_ADMIN && 
    role !== ROLES.HOSPITAL_FRONT_DESK && 
    role !== ROLES.HOSPITAL_LAB_TECHNICIAN && 
    role !== ROLES.DOCTOR
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Access Denied: You do not have permission to upload verified documents.</h1>
      </div>
    );
  }

  // Component State
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [detail, setDetail] = React.useState('');
  const [patientId, setPatientId] = React.useState<string>('');
  const [appointmentId, setAppointmentId] = React.useState<string>('');
  const [labTestId, setLabTestId] = React.useState<string>('');

  // controller state
  const {uploadVerifiedDocument, loading, error, success, clearMessages} = useDocumentController();
  
  // upload handler
  const handleUpload = async () => {
    try {
      if (!selectedFile || !detail.trim()) return;

      const pId = patientId.trim() ? Number(patientId.trim()) : undefined;
      const aId = appointmentId.trim() ? Number(appointmentId.trim()) : undefined;
      const lId = labTestId.trim() ? Number(labTestId.trim()) : undefined;

      await uploadVerifiedDocument(selectedFile, detail.trim(), pId, aId, lId);

      // reset state
      setSelectedFile(null);
      setPatientId('');
      setAppointmentId('');
      setLabTestId('');
      setDetail('');
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  return (
    <>
      {/* error */}
      {error && <Alert type="error" title="Error" message={error} onClose={clearMessages} />}

      {/* success */}
      {success && <Alert type="success" title="Success" message={success} onClose={clearMessages} />}

      {/* Verified Upload Component */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upload Verified Document</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#d0d0d0] mb-2">Select File</label>
              <FileUploadZone selectedFile={selectedFile} onFileSelect={setSelectedFile} onFileRemove={() => setSelectedFile(null)} disabled={loading} />
            </div>

            <div>
              <p className="text-xs text-red-500">TODO: change patient id to email</p>
              <p className="text-xs text-red-500">TODO: find a better way to get appointment and lab test ids</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput label="Patient ID (optional)" value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Patient ID or leave empty" />
              <TextInput label="Appointment ID (optional)" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} placeholder="123" />
              <TextInput label="Lab Test ID (optional)" value={labTestId} onChange={(e) => setLabTestId(e.target.value)} placeholder="456" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#d0d0d0] mb-2">Description</label>
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#404040] rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary" />
            </div>

            <div className="flex gap-2">
              <button onClick={handleUpload} disabled={!selectedFile || !detail.trim() || loading} className="px-4 py-2 bg-primary text-white rounded-lg">{loading ? 'Uploading...' : 'Upload Verified'}</button>
              <button onClick={() => { setSelectedFile(null); setAppointmentId(''); setLabTestId(''); setDetail(''); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Clear</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}