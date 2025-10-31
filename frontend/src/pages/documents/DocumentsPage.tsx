import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaPlus } from "react-icons/fa";
import ROUTES from "../../constants/routes";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import type { Document } from "../../models/Document";
import DocumentCard from "./components/DocumentCard";
import { fetchAllDocuments } from '../../services/documentService';

interface DocumentsData {
  verified_documents: Document[];
  unverified_documents: Document[];
}

function DocumentsPage() {
  const navigate = useNavigate();
  const role = useUserRole();

  const [documents, setDocuments] = useState<DocumentsData>({
    verified_documents: [],
    unverified_documents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "verified" | "unverified">(
    "all"
  );

  const canUpload =
    role === ROLES.PATIENT ||
    role === ROLES.DOCTOR ||
    role === ROLES.HOSPITAL_ADMIN ||
    role === ROLES.HOSPITAL_SUB_ADMIN;

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchAllDocuments()
      .then(setDocuments)
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load documents");
        setDocuments({ verified_documents: [], unverified_documents: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleViewDocument = (document: Document) => {
    navigate(ROUTES.DOCUMENT_DETAILS.replace(":documentId", document.document_id), {
      state: { document },
    });
  };

  const getFilteredDocuments = () => {
    const allDocs = [
      ...documents.verified_documents,
      ...documents.unverified_documents,
    ];

    if (activeTab === "verified") {
      return documents.verified_documents;
    } else if (activeTab === "unverified") {
      return documents.unverified_documents;
    }
    return allDocs;
  };

  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3 drop-shadow-sm">
          <FaFileAlt className="text-blue-600 text-4xl" /> Documents
        </h1>
        {canUpload && (
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-lg font-semibold"
            onClick={() => navigate(ROUTES.UPLOAD_DOCUMENT)}
          >
            <FaPlus /> Upload Document
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-all shadow-sm border-2 ${
            activeTab === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-all shadow-sm border-2 ${
            activeTab === "verified"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-green-700 border-green-200 hover:bg-green-50"
          }`}
          onClick={() => setActiveTab("verified")}
        >
          Verified
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-all shadow-sm border-2 ${
            activeTab === "unverified"
              ? "bg-yellow-500 text-white border-yellow-500"
              : "bg-white text-yellow-700 border-yellow-200 hover:bg-yellow-50"
          }`}
          onClick={() => setActiveTab("unverified")}
        >
          Unverified
        </button>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-16">
            <div className="text-blue-500 text-xl animate-pulse">Loading documents...</div>
          </div>
        ) : error ? (
          <div className="col-span-full flex justify-center items-center py-16">
            <div className="text-red-600 text-lg font-semibold">{error}</div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full flex justify-center items-center py-16">
            <div className="text-gray-400 text-lg">No documents found.</div>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.document_id} className="flex justify-center">
              <DocumentCard
                document={doc}
                isVerified={doc.is_verified}
                onView={handleViewDocument}
              />
            </div>
          ))
        )}
      </div>

      {/* Results Count */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Showing {filteredDocuments.length} documents
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;
