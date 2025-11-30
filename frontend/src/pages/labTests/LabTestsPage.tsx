import React, { useState } from 'react';
import { useNavbar } from '../../hooks/useNavbar';
import Table, { type TableColumn } from '../../components/Table';
import { StackedCell, Badge, ActionButtons } from '../../components/TableHelpers';

interface LabTest {
  id: string;
  testName: string;
  patient: string;
  dateOrdered: string;
  status: 'pending' | 'processing' | 'completed';
  results?: string;
}

const LabTestsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  useNavbar({
    title: 'Lab Tests',
    showSearch: true,
    searchPlaceholder: 'Search tests by patient, type, or date...',
  });

  const mockLabTests: LabTest[] = [
    {
      id: 'LAB-001',
      testName: 'Complete Blood Count (CBC)',
      patient: 'John Doe',
      dateOrdered: 'Nov 28, 2025',
      status: 'completed',
      results: 'Available',
    },
    {
      id: 'LAB-002',
      testName: 'Lipid Panel',
      patient: 'Ali Khan',
      dateOrdered: 'Nov 30, 2025',
      status: 'processing',
    },
    {
      id: 'LAB-003',
      testName: 'Thyroid Function Test',
      patient: 'Maria Silva',
      dateOrdered: 'Nov 30, 2025',
      status: 'pending',
    },
    {
      id: 'LAB-004',
      testName: 'HbA1c Test',
      patient: 'Fatima Ahmed',
      dateOrdered: 'Nov 27, 2025',
      status: 'completed',
      results: 'Available',
    },
    {
      id: 'LAB-005',
      testName: 'Urinalysis',
      patient: 'Ahmed Hassan',
      dateOrdered: 'Nov 29, 2025',
      status: 'processing',
    },
    {
      id: 'LAB-006',
      testName: 'Liver Function Test',
      patient: 'Sarah Johnson',
      dateOrdered: 'Nov 28, 2025',
      status: 'completed',
      results: 'Available',
    },
    {
      id: 'LAB-007',
      testName: 'Blood Glucose Test',
      patient: 'Emma Wilson',
      dateOrdered: 'Nov 30, 2025',
      status: 'pending',
    },
    {
      id: 'LAB-008',
      testName: 'Chest X-Ray',
      patient: 'Bilal Hassan',
      dateOrdered: 'Nov 29, 2025',
      status: 'processing',
    },
    {
      id: 'LAB-009',
      testName: 'Kidney Function Test',
      patient: 'Omar Khan',
      dateOrdered: 'Nov 27, 2025',
      status: 'completed',
      results: 'Available',
    },
    {
      id: 'LAB-010',
      testName: 'Vitamin D Test',
      patient: 'Zainab Ali',
      dateOrdered: 'Nov 30, 2025',
      status: 'pending',
    },
  ];

  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'info';
    }
  };

  const columns: TableColumn<LabTest>[] = [
    {
      key: 'testName',
      header: 'Test Name',
      render: (test) => <StackedCell primary={test.testName} secondary={test.id} />,
    },
    {
      key: 'patient',
      header: 'Patient',
      hideOnMobile: true,
      render: (test) => <span className="text-gray-600">{test.patient}</span>,
    },
    {
      key: 'dateOrdered',
      header: 'Date Ordered',
      hideOnTablet: true,
      render: (test) => <span className="text-gray-600">{test.dateOrdered}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (test) => (
        <Badge variant={getStatusVariant(test.status)}>
          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'results',
      header: 'Results',
      hideOnTablet: true,
      render: (test) =>
        test.results ? (
          <ActionButtons
            buttons={[
              {
                label: 'View Results',
                variant: 'primary',
                onClick: () => console.log('View results:', test.id),
              },
            ]}
          />
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        ),
    },
  ];

  return (
    <>

      <Table
        columns={columns}
        data={mockLabTests}
        onRowClick={(test) => console.log('Clicked test:', test.id)}
        pagination={{
          currentPage,
          totalPages: 1,
          totalItems: mockLabTests.length,
          itemsPerPage: 10,
        onPageChange: setCurrentPage,
      }}
    />
    </>
  );
};

export default LabTestsPage;