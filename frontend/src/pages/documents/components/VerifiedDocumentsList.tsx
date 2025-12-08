import React from 'react';
import Table, { type TableColumn } from '../../../components/table';
import { DocumentModel } from '../../../models/document';
import { StackedCell, Badge, ActionButtons } from '../../../components/TableHelpers';
import { getDocumentTypeColor, formatDocumentType } from '../../../constants/documentTypes';

interface VerifiedDocumentsListProps {
  documents: DocumentModel[];
  loading: boolean;
  onViewDocument: (document: DocumentModel) => void;
  onDownloadDocument: (documentId: string, originalName: string) => void;
}

export const VerifiedDocumentsList: React.FC<VerifiedDocumentsListProps> = ({
  documents,
  loading,
  onViewDocument,
  onDownloadDocument,
}) => {
  const columns: TableColumn<DocumentModel>[] = [
    {
      key: "originalName",
      header: "Document Name",
      render: (doc) => {
        const fileName = doc.originalName;
        const lastDotIndex = fileName.lastIndexOf('.');
        const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
        
        return (
          <StackedCell 
            primary={nameWithoutExt} 
            secondary={`${doc.fileSizeInMB} MB`}
            tertiary={extension}
          />
        );
      },
    },
    {
      key: "documentType",
      header: "Type",
      hideOnMobile: true,
      render: (doc) => {
        const variant = getDocumentTypeColor(doc.documentType);
        return (
          <Badge variant={variant}>
            {formatDocumentType(doc.documentType)}
          </Badge>
        );
      },
    },
    {
      key: "uploaderFullName",
      header: "Uploaded By",
      hideOnMobile: true,
      render: (doc) => (
        <span className="text-gray-600 dark:text-[#a0a0a0]">
          {doc.uploaderFullName || "N/A"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      hideOnTablet: true,
      render: (doc) => (
        <span className="text-gray-600 dark:text-[#a0a0a0]">
          {doc.createdAt.toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (doc) => (
        <ActionButtons
          buttons={[
            {
              label: "View",
              variant: "secondary",
              onClick: () => onViewDocument(doc),
            },
            {
              label: "Download",
              variant: "primary",
              onClick: () => onDownloadDocument(doc.documentId, doc.originalName),
            },
          ]}
        />
      ),
    },
  ];


  return (
    <Table
      columns={columns}
      data={documents}
      loading={loading}
      itemsPerPage={10}
      emptyMessage="No verified documents found."
    />
  );
};
