import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaFilter, FaSearch } from "react-icons/fa";
import { useDocument } from "../../hooks/useDocument";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import Button from "../../components/Button";
import DocumentCard from "./components/DocumentCard";
import ROUTES from "../../constants/routes";
import type { Document } from "../../models/Document";

function DocumentsPage() {
  const navigate = useNavigate();
  const role = useUserRole();
  const { 
    verifiedDocuments, 
    unverifiedDocuments, 
    loading, 
    error, 
    success, 
    fetchAllDocuments,
    clearMessages 
  } = useDocument();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "unverified">("all");
  const [filterType, setFilterType] = useState<"all" | "personal" | "lab test" | "prescription">("all");

  const canUpload = role === ROLES.PATIENT;

  useEffect(() => {
    fetchAllDocuments();
  }, [fetchAllDocuments]);

  const getFilteredDocuments = useMemo(() => {
    // Combine all documents
    const allDocs: Document[] = [];
    
    // Safely add verified documents
    if (Array.isArray(verifiedDocuments)) {
      allDocs.push(...verifiedDocuments);
    }
    
    // Safely add unverified documents
    if (Array.isArray(unverifiedDocuments)) {
      allDocs.push(...unverifiedDocuments);
    }

    return allDocs.filter((doc) => {
      // Filter by status
      if (filterStatus === "verified" && !doc.is_verified) return false;
      if (filterStatus === "unverified" && doc.is_verified) return false;

      // Filter by type
      if (filterType !== "all" && doc.document_type !== filterType) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesType = doc.document_type?.toLowerCase().includes(query);
        const matchesDetail = doc.detail?.toLowerCase().includes(query);
        const matchesName = doc.original_name?.toLowerCase().includes(query) || 
                           doc.file_name?.toLowerCase().includes(query);
        
        if (!matchesType && !matchesDetail && !matchesName) return false;
      }

      return true;
    });
  }, [verifiedDocuments, unverifiedDocuments, searchQuery, filterStatus, filterType]);

  const filteredDocuments = getFilteredDocuments;

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        {/* {canUpload && (
          <Button
            label="Upload Document"
            icon={<FaUpload />}
            onClick={() => navigate(ROUTES.UPLOAD_DOCUMENT)}
          />
        )} */}
      </div>

      {/* Messages */}
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

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex justify-between items-center">
          <span>{success}</span>
          <button 
            onClick={clearMessages}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="personal">Personal</option>
            <option value="lab test">Lab Test</option>
            <option value="prescription">Prescription</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading documents...</div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <p className="text-gray-500 mb-4">
            {searchQuery || filterStatus !== "all" || filterType !== "all"
              ? "No documents found matching your filters"
              : "No documents uploaded yet"}
          </p>
          {canUpload && !searchQuery && filterStatus === "all" && filterType === "all" && (
            <Button
              label="Upload Your First Document"
              icon={<FaUpload />}
              onClick={() => navigate(ROUTES.UPLOAD_DOCUMENT)}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              document={doc}
              onClick={() => navigate(`${ROUTES.DOCUMENTS}/${doc.document_id}`)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Showing {filteredDocuments.length} of {(verifiedDocuments?.length || 0) + (unverifiedDocuments?.length || 0)} documents
            {" • "}
            {verifiedDocuments?.length || 0} verified, {unverifiedDocuments?.length || 0} unverified
          </p>
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;
