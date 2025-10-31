
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaDownload, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import Button from "../../components/Button";
import ROUTES from "../../constants/routes";
import type { Document } from "../../models/Document";
import { fetchAllDocuments } from '../../services/documentService';


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

  const [document, setDocument] = useState<Document | null>(location.state?.document || null);
  const [loading, setLoading] = useState(!document);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!document && documentId) {
      setLoading(true);
      setError("");
      fetchAllDocuments()
        .then((docs) => {
          const allDocs = [...docs.verified_documents, ...docs.unverified_documents];
          const foundDoc = allDocs.find((doc) => doc.document_id === documentId);
          if (foundDoc) {
            setDocument(foundDoc);
          } else {
            setError("Document not found");
          }
        })
        .catch((err) => {
          setError(err?.response?.data?.message || "Failed to load document details");
        })
        .finally(() => setLoading(false));
    }
  }, [documentId, document]);

  const handleDownload = async () => {
    if (!document) return;
    // Placeholder for download logic
    alert("Download functionality needs backend endpoint");
  };

  if (loading) {
    return <div className="text-center text-blue-500 py-16 text-xl animate-pulse">Loading document details...</div>;
  }
  if (error) {
    return <div className="text-center text-red-600 py-16 text-lg font-semibold">{error}</div>;
  }
  if (!document) {
    return null;
  }

  const isVerified = document.is_verified;

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="flex items-center gap-6 mb-6">
        <div className={`p-4 rounded-full ${isVerified ? "bg-green-100" : "bg-blue-100"}`}>
          <FaFileAlt className={isVerified ? "text-green-600" : "text-blue-600"} size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{document.original_name}</h2>
          <div className="flex gap-2 mt-1">
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${isVerified ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{isVerified ? "Verified" : "Unverified"}</span>
            {document.document_type && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full capitalize">{document.document_type}</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-10 space-y-8 border border-blue-100">
        <div className="space-y-3 text-gray-700 text-lg">
          <p><span className="font-semibold">Details:</span> {document.detail}</p>
          {document.uploaded_by_first_name && (
            <p><span className="font-semibold">Uploaded by:</span> {document.uploaded_by_first_name} {document.uploaded_by_last_name}</p>
          )}
          {document.lab_test_name && (
            <p><span className="font-semibold">Lab Test:</span> {document.lab_test_name}</p>
          )}
          <p><span className="font-semibold">File Size:</span> {formatFileSize(document.file_size)}</p>
          <p><span className="font-semibold">Uploaded At:</span> {new Date(document.created_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-6 pt-6">
          <Button label="Download" icon={<FaDownload />} onClick={handleDownload} />
          <Button label="Back to Documents" icon={<FaArrowLeft />} variant="secondary" onClick={() => navigate(ROUTES.DOCUMENTS)} />
        </div>
      </div>

      {/* PDF Viewer Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
        <div className="p-6">
          <h3 className="font-medium text-gray-900 mb-3">Document Preview</h3>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">PDF Preview</p>
            <p className="text-sm text-gray-500">
              PDF viewer integration would be implemented here
            </p>
            <Button
              label="Download to View"
              onClick={handleDownload}
              className="mt-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentDetailsPage;
