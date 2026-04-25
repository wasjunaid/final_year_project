import React, { useState, useEffect } from 'react';
import { DocumentModel } from '../../models/document';
import TextInput from '../../components/TextInput';
import { FileUploadZone } from '../../components/FileUploadZone';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { useDocumentController } from '../../hooks/document';

interface Props {
  placeholder?: DocumentModel | null;
  onUploaded?: () => void;
  onCancel?: () => void;
}

export const UploadAgainstPlaceholderPage: React.FC<Props> = ({ placeholder, onUploaded, onCancel }) => {
  const documentCtrl = useDocumentController();
  const [file, setFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<string>(placeholder?.detail ?? '');

  useEffect(() => {
    setDetail(placeholder?.detail ?? '');
    setFile(null);
  }, [placeholder]);

  const handleUpload = async () => {
    if (!placeholder || !file || !detail.trim()) return;
    try {
      await documentCtrl.uploadVerifiedDocumentAgainstPlaceholder(placeholder.documentId, file, detail.trim());
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  if (!placeholder) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No placeholder selected. Go to Placeholders tab and choose one.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {documentCtrl.error && <div className="mb-4"><Alert type="error" message={documentCtrl.error} /></div>}

      <div className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upload Verified Document</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <TextInput label="Patient ID" value={String(placeholder.patientId ?? '')} onChange={() => {}} readOnly />
          <TextInput label="Appointment ID" value={String(placeholder.appointmentId ?? '')} onChange={() => {}} readOnly />
          <TextInput label="Lab Test ID" value={String(placeholder.labTestId ?? '')} onChange={() => {}} readOnly />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-[#d0d0d0] mb-2">Select File</label>
          <FileUploadZone selectedFile={file} onFileSelect={setFile} onFileRemove={() => setFile(null)} disabled={documentCtrl.isUploading} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-[#d0d0d0] mb-2">Description</label>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#404040] rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary" />
        </div>

        <div className="flex gap-2">
          <Button variant="success" onClick={handleUpload} loading={documentCtrl.isUploading} disabled={!file || !detail.trim()}>Upload Verified</Button>
          <Button variant="outline" onClick={() => onCancel?.()}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default UploadAgainstPlaceholderPage;
