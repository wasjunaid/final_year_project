import React, { useState } from 'react';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_OPTIONS } from '../../../../constants/documentTypes';
import { FileUploadZone } from '../../../../components/FileUploadZone';

interface UploadDocumentProps {
  loading: boolean;
  error: string | null;
  success: string | null;
  uploadProgress: number;
  isUploading: boolean;
  onUpload: (file: File, documentType: string, documentDetail: string) => Promise<void>;
}

export const UploadDocument: React.FC<UploadDocumentProps> = ({
  loading,
  error,
  success,
  uploadProgress,
  isUploading,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES.PERSONAL);
  const [documentDetail, setDocumentDetail] = useState("");

  const handleUploadClick = async () => {
    if (!selectedFile || !documentDetail.trim()) {
      return;
    }

    try {
      await onUpload(selectedFile, documentType, documentDetail.trim());
      
      // Reset form on success
      setSelectedFile(null);
      setDocumentType(DOCUMENT_TYPES.PERSONAL);
      setDocumentDetail("");
    } catch (error) {
      // Error handled by parent
      console.error("Upload failed:", error);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Upload New Document
        </h2>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* File Upload Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d0d0d0] mb-2">
              Select File
            </label>
            <FileUploadZone
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onFileRemove={handleFileRemove}
              disabled={loading}
            />
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d0d0d0] mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#404040] rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Document Detail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d0d0d0] mb-2">
              Description
            </label>
            <textarea
              value={documentDetail}
              onChange={(e) => setDocumentDetail(e.target.value)}
              placeholder="Add a brief description of this document..."
              rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#404040] rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-700 dark:text-[#d0d0d0]">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#404040] rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            disabled={!selectedFile || !documentDetail.trim() || isUploading}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>
    </div>
  );
};
