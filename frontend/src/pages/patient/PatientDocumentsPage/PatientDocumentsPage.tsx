// PatientDocumentsPage - Main documents page for patients

import { useState, useEffect, useMemo } from "react";
import type { NavbarConfig } from "../../../models/navbar/model";
import { useNavbarController } from "../../../hooks/ui/navbar";
import { useDocumentController } from "../../../hooks/document";
import { DocumentModel } from "../../../models/document";
import {
  AllDocumentsList,
  VerifiedDocumentsList,
  UnverifiedDocumentsList,
  UploadDocument,
  DocumentDetailsView,
} from "./components";

export const PatientDocumentsPage = () => {
  const documentController = useDocumentController();
  
  // Details view state
  const [selectedDocument, setSelectedDocument] = useState<DocumentModel | null>(null);

  // Fetch all documents on mount
  useEffect(() => {
    documentController.fetchAllDocuments();
  }, []);

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

  const { activeTab = "all" } = useNavbarController(navbarConfig);

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
        <UploadDocument
          loading={documentController.loading}
          error={documentController.error}
          success={documentController.success}
          uploadProgress={documentController.uploadProgress}
          isUploading={documentController.isUploading}
          onUpload={handleUpload}
        />
        )}
      </>
      )}
    </>
  );
};
