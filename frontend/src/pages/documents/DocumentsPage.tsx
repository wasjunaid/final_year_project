import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaDownload, FaEye, FaCheckCircle, FaClock } from "react-icons/fa";
import { useUserRole } from "../../hooks/useUserRole";
import { useDocument } from "../../hooks/useDocument";
import { ROLES } from "../../constants/roles";
import ROUTES from "../../constants/routes";
import Button from "../../components/Button";
import type { Document } from "../../models/Document";

function DocumentsPage() {
  const navigate = useNavigate();
  const role = useUserRole();
  const { documentsData, loading, error, getAll, downloadDocument, clearMessages } = useDocument();

  const [activeTab, setActiveTab] = useState<"all" | "verified" | "unverified">("all");

  const canUpload = role === ROLES.PATIENT;

  useEffect(() => {
    getAll();
  }, [getAll]);

  const handleDownload = async (doc: Document) => {
    const filename = `${doc.document_type}_${doc.document_id}.${doc.file_type.split('/')[1] || 'pdf'}`;
    await downloadDocument(doc.document_id, filename);
  };

  const getFilteredDocuments = (): Document[] => {
    switch (activeTab) {
      case 'verified':
        return documentsData.verified_documents;
      case 'unverified':
        return documentsData.unverified_documents;
      case 'all':
      default:
        return [...documentsData.verified_documents, ...documentsData.unverified_documents];
    }
  };

  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        {/* {canUpload && (
          <Button
            label="Upload Document"
            icon={<FaUpload />}
            onClick={() => navigate(ROUTES.UPLOAD_DOCUMENT)}
          />
        )} */}
      </div>

      {/* Error Message */}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          All Documents ({documentsData.verified_documents.length + documentsData.unverified_documents.length})
        </button>
        <button
          onClick={() => setActiveTab("verified")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "verified"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Verified ({documentsData.verified_documents.length})
        </button>
        <button
          onClick={() => setActiveTab("unverified")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "unverified"
              ? "text-yellow-600 border-b-2 border-yellow-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Unverified ({documentsData.unverified_documents.length})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading documents...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDocuments.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg mb-2">No documents found</p>
          <p className="text-sm mb-4">
            {activeTab === "all" && "You haven't uploaded any documents yet."}
            {activeTab === "verified" && "You don't have any verified documents yet."}
            {activeTab === "unverified" && "You don't have any unverified documents yet."}
          </p>
          {canUpload && (
            <Button
              label="Upload Document"
              icon={<FaUpload />}
              onClick={() => navigate(ROUTES.UPLOAD_DOCUMENT)}
            />
          )}
        </div>
      )}

      {/* Documents Grid */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.document_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{doc.document_type}</h3>
                  {doc.detail && (
                    <p className="text-sm text-gray-600 line-clamp-2">{doc.detail}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 ${
                    doc.is_verified
                      ? 'text-green-600 bg-green-50 border-green-200'
                      : 'text-yellow-600 bg-yellow-50 border-yellow-200'
                  }`}
                >
                  {doc.is_verified ? (
                    <>
                      <FaCheckCircle /> Verified
                    </>
                  ) : (
                    <>
                      <FaClock /> Pending
                    </>
                  )}
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-3 space-y-1">
                <p>Type: {doc.file_type}</p>
                <p>Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                {doc.uploaded_for !== 'SELF' && (
                  <p className="text-blue-600 font-medium">
                    For: {doc.uploaded_for.replace('_', ' ')}
                  </p>
                )}
                {doc.appointment_id && (
                  <p>Appointment ID: {doc.appointment_id}</p>
                )}
                {doc.lab_test_id && (
                  <p>Lab Test ID: {doc.lab_test_id}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;
