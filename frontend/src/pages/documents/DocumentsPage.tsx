import React, { useState } from 'react';
import { useNavbar } from '../../hooks/useNavbar';
import Table, { type TableColumn } from '../../components/Table';
import { StackedCell, Badge, ActionButtons, IconText } from '../../components/TableHelpers';

interface Document {
  id: string;
  name: string;
  patient: string;
  type: string;
  date: string;
  size: string;
}

const DocumentsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  useNavbar({
    title: 'Documents',
    showSearch: true,
    searchPlaceholder: 'Search documents by patient, type, or date...',
  });

  const mockDocuments: Document[] = [
    {
      id: 'DOC-001',
      name: 'Lab Results - Blood Test',
      patient: 'John Doe',
      type: 'Lab Report',
      date: 'Nov 28, 2025',
      size: '2.3 MB',
    },
    {
      id: 'DOC-002',
      name: 'X-Ray Chest',
      patient: 'Ali Khan',
      type: 'Imaging',
      date: 'Nov 29, 2025',
      size: '5.1 MB',
    },
    {
      id: 'DOC-003',
      name: 'Prescription - Antibiotics',
      patient: 'Maria Silva',
      type: 'Prescription',
      date: 'Nov 27, 2025',
      size: '156 KB',
    },
    {
      id: 'DOC-004',
      name: 'Medical Certificate',
      patient: 'Fatima Ahmed',
      type: 'Certificate',
      date: 'Nov 25, 2025',
      size: '98 KB',
    },
    {
      id: 'DOC-005',
      name: 'MRI Scan - Brain',
      patient: 'Ahmed Hassan',
      type: 'Imaging',
      date: 'Nov 30, 2025',
      size: '12.4 MB',
    },
    {
      id: 'DOC-006',
      name: 'ECG Report',
      patient: 'Sarah Johnson',
      type: 'Lab Report',
      date: 'Nov 29, 2025',
      size: '1.8 MB',
    },
    {
      id: 'DOC-007',
      name: 'Vaccination Record',
      patient: 'Emma Wilson',
      type: 'Certificate',
      date: 'Nov 26, 2025',
      size: '245 KB',
    },
    {
      id: 'DOC-008',
      name: 'Ultrasound - Abdominal',
      patient: 'Bilal Hassan',
      type: 'Imaging',
      date: 'Nov 28, 2025',
      size: '8.7 MB',
    },
    {
      id: 'DOC-009',
      name: 'Prescription - Insulin',
      patient: 'Omar Khan',
      type: 'Prescription',
      date: 'Nov 30, 2025',
      size: '134 KB',
    },
    {
      id: 'DOC-010',
      name: 'Blood Pressure Log',
      patient: 'Zainab Ali',
      type: 'Lab Report',
      date: 'Nov 27, 2025',
      size: '567 KB',
    },
  ];

  const columns: TableColumn<Document>[] = [
    {
      key: 'name',
      header: 'Document Name',
      render: (doc) => (
        <IconText
          icon={
            <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
          }
          text={<StackedCell primary={doc.name} secondary={doc.size} />}
        />
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      hideOnMobile: true,
      render: (doc) => <span className="text-gray-600">{doc.patient}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      hideOnTablet: true,
      render: (doc) => <Badge variant="purple">{doc.type}</Badge>,
    },
    {
      key: 'date',
      header: 'Date',
      hideOnTablet: true,
      render: (doc) => <span className="text-gray-600">{doc.date}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (doc) => (
        <ActionButtons
          buttons={[
            {
              label: 'View',
              variant: 'primary',
              onClick: () => console.log('View document:', doc.id),
            },
            {
              label: 'Download',
              variant: 'success',
              onClick: () => console.log('Download document:', doc.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={mockDocuments}
        pagination={{
          currentPage,
          totalPages: 1,
          totalItems: mockDocuments.length,
          itemsPerPage: 10,
          onPageChange: setCurrentPage,
        }}
      />
    </>
  );
};

export default DocumentsPage;
