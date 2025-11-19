import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaDownload, FaFileAlt, FaArrowLeft, FaCheckCircle, FaClock } from "react-icons/fa";
import Button from "../../components/Button";
import ROUTES from "../../constants/routes";
import type { Document } from "../../models/Document";
import { useDocument } from "../../hooks/useDocument";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function DocumentDetailsPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { getById, downloadDocument, loading: hookLoading, error: hookError } = useDocument();

  const [document, setDocument] = useState<Document | null>(location.state?.document || null);
  const [loading, setLoading] = useState(!document);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocument = async () => {
      if (!document && documentId) {
        setLoading(true);
        setError("");
        
        try {
          const doc = await getById(parseInt(documentId));
          if (doc) {
            setDocument(doc);
          } else {
            setError("Document not found");
          }
        } catch (err: any) {
          setError(err?.response?.data?.message || "Failed to load document details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDocument();
  }, [documentId, document, getById]);

  const handleDownload = async () => {
    if (!document) return;
    
    const filename = `${document.document_type}_${document.document_id}.${document.file_type.split('/')[1] || 'pdf'}`;
    await downloadDocument(document.document_id, filename);
  };

  if (loading || hookLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-blue-500 text-xl animate-pulse">
          Loading document details...
        </div>
      </div>
    );
  }

  if (error || hookError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-4">
            {error || hookError}
          </div>
          <Button
            label="Back to Documents"
            icon={<FaArrowLeft />}
            onClick={() => navigate(ROUTES.DOCUMENTS)}
          />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Document not found</div>
          <Button
            label="Back to Documents"
            icon={<FaArrowLeft />}
            onClick={() => navigate(ROUTES.DOCUMENTS)}
          />
        </div>
      </div>
    );
  }

  const isVerified = document.is_verified;

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(ROUTES.DOCUMENTS)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold">Document Details</h1>
      </div>

      {/* Document Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex items-start gap-6">
            <div className={`p-4 rounded-full ${isVerified ? "bg-green-100" : "bg-yellow-100"}`}>
              <FaFileAlt className={isVerified ? "text-green-600" : "text-yellow-600"} size={40} />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {document.document_type}
              </h2>
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${
                    isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {isVerified ? (
                    <>
                      <FaCheckCircle /> Verified
                    </>
                  ) : (
                    <>
                      <FaClock /> Pending Verification
                    </>
                  )}
                </span>
                {document.uploaded_for && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    {document.uploaded_for.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Document Details
                </h3>
                <p className="text-gray-900">{document.detail || 'No details provided'}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  File Type
                </h3>
                <p className="text-gray-900">{document.file_type}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  File Size
                </h3>
                <p className="text-gray-900">{formatFileSize(document.file_size)}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Uploaded At
                </h3>
                <p className="text-gray-900">
                  {new Date(document.created_at).toLocaleString()}
                </p>
              </div>

              {document.uploader_name && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Uploaded By
                  </h3>
                  <p className="text-gray-900">{document.uploader_name}</p>
                  {document.uploader_email && (
                    <p className="text-sm text-gray-600">{document.uploader_email}</p>
                  )}
                </div>
              )}

              {document.appointment_id && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Appointment ID
                  </h3>
                  <p className="text-gray-900">{document.appointment_id}</p>
                </div>
              )}

              {document.lab_test_id && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Lab Test ID
                  </h3>
                  <p className="text-gray-900">{document.lab_test_id}</p>
                </div>
              )}

              {isVerified && document.verified_at && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Verified At
                  </h3>
                  <p className="text-gray-900">
                    {new Date(document.verified_at).toLocaleString()}
                  </p>
                  {document.verifier_name && (
                    <p className="text-sm text-gray-600">By: {document.verifier_name}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              label="Download Document"
              icon={<FaDownload />}
              onClick={handleDownload}
            />
            <Button
              label="Back to Documents"
              icon={<FaArrowLeft />}
              variant="secondary"
              onClick={() => navigate(ROUTES.DOCUMENTS)}
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Document Preview</h3>
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <FaFileAlt className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2 text-lg">Preview Not Available</p>
            <p className="text-sm text-gray-500 mb-4">
              Download the document to view its contents
            </p>
            <Button
              label="Download to View"
              icon={<FaDownload />}
              onClick={handleDownload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentDetailsPage;
