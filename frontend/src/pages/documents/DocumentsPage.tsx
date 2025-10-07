import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt } from "react-icons/fa";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import ROUTES from "../../constants/routes";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import type { Document } from "../../models/Document";
import { DocumentCard } from "./components/DocumentCard";

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
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(EndPoints.documents.get);
      setDocuments(res.data.data);
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to view these documents.");
        setDocuments({ verified_documents: [], unverified_documents: [] });
        return;
      } else if (err.response && err.response.status === 404) {
        setDocuments({ verified_documents: [], unverified_documents: [] });
        return;
      }
      setError(err.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document: Document) => {
    navigate(`${ROUTES.DOCUMENT_DETAILS}/${document.document_id}`, {
      state: { document },
    });
  };

  const getFilteredDocuments = () => {
    const allDocs = [
      ...documents.verified_documents.map((doc) => ({
        ...doc,
        isVerified: true,
      })),
      ...documents.unverified_documents.map((doc) => ({
        ...doc,
        isVerified: false,
      })),
    ];

    if (activeTab === "verified") {
      return allDocs.filter((doc) => doc.isVerified);
    } else if (activeTab === "unverified") {
      return allDocs.filter((doc) => !doc.isVerified);
    }
    return allDocs;
  };

  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="flex flex-col h-full p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(["all", "verified", "unverified"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab} (
            {tab === "all"
              ? documents.verified_documents.length +
                documents.unverified_documents.length
              : tab === "verified"
              ? documents.verified_documents.length
              : documents.unverified_documents.length}
            )
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading documents...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        documents.verified_documents.length === 0 &&
        documents.unverified_documents.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <FaFileAlt className="mx-auto text-4xl mb-4 text-gray-300" />
            <p className="text-lg mb-2">No documents found</p>
            <p className="text-sm mb-4">
              {canUpload
                ? "Upload your first document to get started"
                : "No documents have been shared with you yet"}
            </p>
          </div>
        )}

      {/* Documents Grid */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              document={doc}
              isVerified={doc.isVerified}
              onView={handleViewDocument}
            />
          ))}
        </div>
      )}

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
