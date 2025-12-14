import React, { useState } from "react";
import Alert from "../../../../components/Alert";
import Button from "../../../../components/Button";
import Table, { type TableColumn } from "../../../../components/table";
import { StackedCell } from "../../../../components/TableHelpers";
import { useLabTestController } from "../../../../hooks/labTest";
import type { LabTest } from "../../../../models/labTest/model";
import EditLabTest from "./EditLabTest";

const LabTestList: React.FC = () => {
  const { labTests, loading, error, success, clearMessages } = useLabTestController();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);

  const formatDateParts = (value?: string | Date) => {
    if (!value) return { date: 'N/A', time: '' };
    const d = new Date(value);
    return { date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
  };

  const handleEdit = (labTest: LabTest) => {
    setSelectedLabTest(labTest);
    setIsEditing(true);
  };

  const columns: TableColumn<LabTest>[] = [
    {
      header: 'Test',
      key: 'test',
      render: (row: LabTest) => <StackedCell primary={row.name} secondary={row.labTestId || 'N/A'} />
    },
    {
      header: 'Cost',
      key: 'cost',
      render: (row: LabTest) => (row.cost != null ? String(row.cost) : 'N/A')
    },
    {
      header: 'Created At',
      key: 'createdAt',
      render: (row: LabTest) => {
        const { date, time } = formatDateParts((row as any).createdAt);
        return <StackedCell primary={date} secondary={time} />;
      }
    },
    {
      header: 'Updated At',
      key: 'updatedAt',
      render: (row: LabTest) => {
        const { date, time } = formatDateParts((row as any).updatedAt);
        return <StackedCell primary={date} secondary={time || 'N/A'} />;
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row: LabTest) => <Button size="sm" variant="primary" onClick={() => handleEdit(row)}> Edit </Button>
    }
  ];
  // Ensure we pass an array to Table; sometimes service may return an object wrapper
  const tableData: LabTest[] = Array.isArray(labTests)
    ? labTests
    : Array.isArray((labTests as any)?.data)
    ? (labTests as any).data
    : [];

  if (!Array.isArray(labTests) && labTests) {
    // Helpful debug in dev: warn about unexpected response shape
    // eslint-disable-next-line no-console
    console.warn('LabTestList: received labTests in unexpected shape:', labTests);
  }

  return (
    <>
      {error && <Alert type="error" title="Error" message={error} onClose={clearMessages} />}
      {success && <Alert type="success" title="Success" message={success} onClose={clearMessages} />}

      {!isEditing && <Table
        columns={columns}
        data={tableData}
        loading={loading}
        emptyMessage="No lab tests available."
      />}

      {isEditing && <EditLabTest
        labTest={selectedLabTest}
        onCancel={() => { setIsEditing(false); setSelectedLabTest(null); }}
        onUpdated={() => {
          setSelectedLabTest(null);
          setIsEditing(false);
        }}
      />}
    </>
  );
}

export default LabTestList;