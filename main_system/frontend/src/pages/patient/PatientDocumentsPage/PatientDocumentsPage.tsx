// PatientDocumentsPage - Main documents page for patients

import { useState, useEffect, useMemo } from "react";
import type { NavbarConfig } from "../../../models/navbar/model";
import { useNavbarController } from "../../../hooks/ui/navbar";
import { useDocumentController } from "../../../hooks/document";
import { DocumentModel } from "../../../models/document";
import { UploadUnverifiedDocument } from "./components";
import { AllDocumentsList, VerifiedDocumentsList, DocumentDetailsView } from '../../documents/components';
import { UnverifiedDocumentsList } from "../../documents/components/UnverifiedDocumentsList";

export const PatientDocumentsPage = () => {
  const documentController = useDocumentController();
  
  // Details view state
  const [selectedDocument, setSelectedDocument] = useState<DocumentModel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Configure navbar with tabs
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: "Documents",
    tabs: [
      { label: "All", value: "all" },
      { label: "Verified", value: "verified" },
      { label: "Unverified", value: "unverified" },
      { label: "Upload", value: "upload" },
    ],
    showSearch: true,
    searchPlaceholder: "Search documents by name or type...",
  }), []);

  const { activeTab = "all", searchQuery, setActiveTab } = useNavbarController(navbarConfig);

  const activePagination = activeTab === 'verified'
    ? documentController.verifiedDocumentsPagination
    : activeTab === 'unverified'
      ? documentController.unverifiedDocumentsPagination
      : documentController.allDocumentsPagination;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    if (!['all', 'verified', 'unverified', 'upload'].includes(activeTab)) {
      setActiveTab('all');
      return;
    }

    if (activeTab === 'upload') {
      return;
    }

    const timer = window.setTimeout(() => {
      const query = { search: searchQuery, page: currentPage, limit: 50 };
      if (activeTab === 'verified') {
        void documentController.fetchVerifiedDocuments(query);
      } else if (activeTab === 'unverified') {
        void documentController.fetchUnverifiedDocuments(query);
      } else {
        void documentController.fetchAllDocuments(query);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeTab, searchQuery, currentPage]);

  // Reset selected document when tab changes
  useEffect(() => {
    setSelectedDocument(null);
  }, [activeTab]);

  const handleUpload = async (file: File, documentType: string, documentDetail: string) => {
    await documentController.uploadUnverifiedDocument(file, documentType, documentDetail);
    
    // No need to refresh - optimistic update already added the document
  };

  const handleDownload = (documentId: string, originalName: string) => {
    documentController.downloadDocument(documentId, originalName);
  };

  const handleViewDocument = (document: DocumentModel) => {
    setSelectedDocument(document);
  };

  const handleBackToList = () => {
    setSelectedDocument(null);
  };

  // Main render
  return (
    <>
      {selectedDocument && (
      <DocumentDetailsView
        document={selectedDocument}
        onBack={handleBackToList}
        onDownload={handleDownload}
      />
      )}

      {!selectedDocument && (
      <>
        {activeTab === "all" && (
        <AllDocumentsList
          documents={documentController.documents}
          loading={documentController.loading}
          onViewDocument={handleViewDocument}
          onDownloadDocument={handleDownload}
        />
        )}

        {activeTab === "verified" && (
        <VerifiedDocumentsList
          documents={documentController.verifiedDocuments}
          loading={documentController.loading}
          onViewDocument={handleViewDocument}
          onDownloadDocument={handleDownload}
        />
        )}

        {activeTab === "unverified" && (
        <UnverifiedDocumentsList
          documents={documentController.unverifiedDocuments}
          loading={documentController.loading}
          onViewDocument={handleViewDocument}
          onDownloadDocument={handleDownload}
        />
        )}

        {activeTab === "upload" && (
        <UploadUnverifiedDocument
          loading={documentController.loading}
          error={documentController.error}
          success={documentController.success}
          uploadProgress={documentController.uploadProgress}
          isUploading={documentController.isUploading}
          onUpload={handleUpload}
        />
        )}

        {activeTab !== 'upload' && activePagination && activePagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              Page {activePagination.page} of {activePagination.totalPages} ({activePagination.totalItems} records)
            </div>
            <button
              type="button"
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
              disabled={documentController.loading || currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
              disabled={documentController.loading || currentPage >= activePagination.totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(activePagination.totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        )}
      </>
      )}
    </>
  );
};
