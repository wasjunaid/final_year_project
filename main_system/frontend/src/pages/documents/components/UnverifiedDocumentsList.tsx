import React from 'react';
import Table, { type TableColumn } from '../../../components/Table';
import { DocumentModel } from '../../../models/document';
import { StackedCell, Badge, ActionButtons } from '../../../components/TableHelpers';
import { getDocumentTypeColor, formatDocumentType } from '../../../constants/documentTypes';

interface UnverifiedDocumentsListProps {
  documents: DocumentModel[];
  loading: boolean;
  onViewDocument: (document: DocumentModel) => void;
  onDownloadDocument: (documentId: string, originalName: string) => void;
}

export const UnverifiedDocumentsList: React.FC<UnverifiedDocumentsListProps> = ({
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
        const fileName = doc.originalName ?? (doc.labTestName ?? 'Untitled');
        const lastDotIndex = fileName ? fileName.lastIndexOf('.') : -1;
        const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
        const sizeStr = (() => {
          try {
            if ((doc as any).fileSizeInMB !== undefined && (doc as any).fileSizeInMB !== null) return `${(doc as any).fileSizeInMB} MB`;
            if ((doc as any).fileSize) return `${(((doc as any).fileSize / (1024 * 1024)) || 0).toFixed(2)} MB`;
          } catch (e) {
            // ignore
          }
          return '';
        })();

        return (
          <StackedCell 
            primary={nameWithoutExt} 
            secondary={sizeStr}
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
      key: "createdAt",
      header: "Upload Date",
      hideOnTablet: true,
      render: (doc) => {
        const dt = doc.createdAt ? (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)) : null;
        return (
          <span className="text-gray-600 dark:text-[#a0a0a0]">
            {dt ? dt.toLocaleDateString() : ''}
          </span>
        );
      },
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
      disableAutoPagination
      emptyMessage="No unverified documents found."
    />
  );
};
