import React, { useEffect } from 'react';
import Table, { type TableColumn } from '../../components/table';
import { useDocumentController } from '../../hooks/document';
import { DocumentModel } from '../../models/document';
import { StackedCell, Badge } from '../../components/TableHelpers';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

interface Props {
  onSelectPlaceholder?: (ph: DocumentModel) => void;
}

export const PlaceholdersPage: React.FC<Props> = ({ onSelectPlaceholder }) => {
  const documentCtrl = useDocumentController();

  useEffect(() => {
    (async () => {
      try {
        await documentCtrl.fetchPlaceholdersForLabTech();
      } catch (e) {
        // controller exposes error
      }
    })();
  }, []);

  const placeholders = documentCtrl.placeholdersForLabTech || [];

  const columns: TableColumn<DocumentModel>[] = [
    {
      key: 'labTestName',
      header: 'Lab Test',
      render: (d) => <StackedCell primary={d.labTestName ?? d.originalName ?? 'Placeholder'} secondary={d.detail ?? ''} />
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (d) => <span className="text-gray-600 dark:text-[#a0a0a0]">{(d as any).patientName ?? d.patientId ?? 'N/A'}</span>
    },
    {
      key: 'appointmentId',
      header: 'Appointment',
      render: (d) => <span className="text-gray-600 dark:text-[#a0a0a0]">{d.appointmentId ?? ''}</span>
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (d) => {
        const dt = d.createdAt ? (d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt)) : null;
        return <span className="text-gray-600 dark:text-[#a0a0a0]">{dt ? dt.toLocaleString() : ''}</span>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => <Badge variant={d.isVerified ? 'success' : 'warning'}>{d.isVerified ? 'Verified' : 'Pending'}</Badge>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onSelectPlaceholder?.(d)}>Upload Verified</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      {documentCtrl.error && (
        <div className="mb-4"><Alert type="error" message={documentCtrl.error} /></div>
      )}
      <Table columns={columns} data={placeholders} loading={documentCtrl.loading} itemsPerPage={10} emptyMessage="No placeholders found." />
    </div>
  );
};

export default PlaceholdersPage;
