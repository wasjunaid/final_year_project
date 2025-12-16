import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, XCircle, ChevronLeft, FileText, Loader2 } from 'lucide-react';
import TextInput from '../../../components/TextInput';
import { DocumentService } from '../../../services/document/documentService';

interface EhrDocumentDetailsViewProps {
  document: any;
  onBack: () => void;
}

export const EhrDocumentDetailsView: React.FC<EhrDocumentDetailsViewProps> = ({
  document,
  onBack,
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Extract filename without extension
  const fileName = document.original_name || 'Untitled';
  const lastDotIndex = fileName.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';

  // Determine if file is PDF or image
  const isPDF = document.mime_type?.toLowerCase().includes('pdf');
  const isImage = document.mime_type?.toLowerCase().startsWith('image/');

  // Load document blob URL when component mounts
  useEffect(() => {
    const loadDocument = async () => {
      setIsLoadingDocument(true);
      setDocumentError(null);
      try {
        const blobUrl = await DocumentService.downloadDocument(document.document_id);
        setDocumentUrl(blobUrl);
      } catch (error) {
        console.error('Error loading document:', error);
        setDocumentError('Failed to load document preview');
      } finally {
        setIsLoadingDocument(false);
      }
    };

    loadDocument();

    // Cleanup blob URL on unmount
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [document.document_id]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blobUrl = await DocumentService.downloadDocument(document.document_id);
      
      // Create a temporary link and trigger download
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = document.original_name || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-[#404040]">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-primary dark:text-white hover:text-primary/80 dark:hover:text-white/80 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-[#404040] rounded"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {nameWithoutExt}
            </h2>
          </div>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </button>
        </div>
        {extension && (
          <p className="text-sm text-gray-500 dark:text-[#a0a0a0] ml-10">
            {extension}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="p-6 space-y-6">
        {/* Status Badge */}
        <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4 border border-gray-200 dark:border-[#404040]">
          <div className="flex items-center gap-2">
            {document.is_verified ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-lg font-semibold text-green-600">Verified</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-orange-600" />
                <span className="text-lg font-semibold text-orange-600">Unverified</span>
              </>
            )}
          </div>
        </div>

        {/* Document Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Document Type"
            value={document.document_type || '-'}
            onChange={() => {}}
            readOnly
          />

          <TextInput
            label="File Type"
            value={document.mime_type || '-'}
            onChange={() => {}}
            readOnly
          />

          <TextInput
            label="Upload Date"
            value={document.created_at ? new Date(document.created_at).toLocaleString() : '-'}
            onChange={() => {}}
            readOnly
          />

          {document.is_verified && document.uploader_full_name && (
            <TextInput
              label="Uploaded By"
              value={document.uploader_full_name}
              onChange={() => {}}
              readOnly
            />
          )}

          {document.hospital_name && (
            <TextInput
              label="Hospital"
              value={document.hospital_name}
              onChange={() => {}}
              readOnly
            />
          )}

          {document.lab_test_name && (
            <TextInput
              label="Lab Test"
              value={document.lab_test_name}
              onChange={() => {}}
              readOnly
            />
          )}
        </div>

        {/* Description */}
        {document.detail && (
          <TextInput
            label="Description"
            value={document.detail}
            onChange={() => {}}
            readOnly
            multiline
            rows={3}
          />
        )}

        {/* Document Viewer */}
        <div className="border-t border-gray-200 dark:border-[#404040] pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Document Preview</h3>
          
          {isLoadingDocument && (
            <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#404040]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-[#a0a0a0]">Loading document...</p>
              </div>
            </div>
          )}

          {documentError && (
            <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#404040]">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 dark:text-[#606060] mx-auto mb-2" />
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">{documentError}</p>
                <button
                  onClick={handleDownload}
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Download instead
                </button>
              </div>
            </div>
          )}

          {!isLoadingDocument && !documentError && documentUrl && (
            <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#404040] overflow-hidden">
              {/* PDF Viewer */}
              {isPDF && (
                <iframe
                  src={documentUrl}
                  className="w-full h-[600px]"
                  title={document.original_name}
                />
              )}

              {/* Image Viewer */}
              {isImage && (
                <div className="p-4 flex justify-center">
                  <img
                    src={documentUrl}
                    alt={document.original_name}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {/* Other file types - show download option */}
              {!isPDF && !isImage && (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 dark:text-[#606060] mb-4" />
                  <p className="text-sm text-gray-600 dark:text-[#a0a0a0] mb-4">
                    Preview not available for {document.mime_type}
                  </p>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download to view
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
