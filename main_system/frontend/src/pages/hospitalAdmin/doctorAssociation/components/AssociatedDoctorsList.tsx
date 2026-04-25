import React from 'react';
import Table, { type TableColumn } from '../../../../components/Table';
import useAssociatedStaffController from '../../../../hooks/hospital/useAssociatedStaffController';
import { Badge, StackedCell } from '../../../../components/TableHelpers';
import type { AssociatedDoctorModel } from '../../../../models/associatedStaff/doctors';

export const AssociatedDoctorsList: React.FC = () => {
  const { doctors, loading, error, removeDoctorHospitalAssociation } = useAssociatedStaffController();

  const handleRemoveDoctor = async (doctorId: number) => {
    const confirmed = window.confirm('Remove this doctor from the hospital?');
    if (!confirmed) return;

    try {
      await removeDoctorHospitalAssociation(doctorId);
      window.alert('Doctor association removed successfully.');
      return;
    } catch (err: any) {
      const initialMessage = err?.message || '';
      if (!initialMessage.toLowerCase().includes('reassignment_mode')) {
        window.alert(initialMessage || 'Failed to remove doctor association.');
        return;
      }
    }

    const modeInput = window.prompt('Doctor has future appointments. Choose reassignment mode: manual or automatic', 'automatic');
    if (!modeInput) return;

    const normalizedMode = modeInput.trim().toLowerCase();
    if (normalizedMode !== 'manual' && normalizedMode !== 'automatic') {
      window.alert('Invalid mode. Please enter manual or automatic.');
      return;
    }

    if (normalizedMode === 'automatic') {
      try {
        await removeDoctorHospitalAssociation(doctorId, { reassignment_mode: 'automatic' });
        window.alert('Doctor removed and appointments reassigned automatically.');
      } catch (err: any) {
        window.alert(err?.message || 'Automatic reassignment failed.');
      }
      return;
    }

    const targetDoctorIdInput = window.prompt('Enter target doctor ID for manual reassignment');
    if (!targetDoctorIdInput) return;

    const targetDoctorId = Number(targetDoctorIdInput);
    if (!Number.isInteger(targetDoctorId) || targetDoctorId <= 0) {
      window.alert('Invalid doctor ID.');
      return;
    }

    try {
      await removeDoctorHospitalAssociation(doctorId, {
        reassignment_mode: 'manual',
        reassigned_doctor_id: targetDoctorId,
      });
      window.alert('Doctor removed and appointments reassigned manually.');
    } catch (err: any) {
      window.alert(err?.message || 'Manual reassignment failed.');
    }
  };

  const doctorColumns: TableColumn<AssociatedDoctorModel>[] = [
    {
      key: 'personStack',
      header: 'Doctor',
      render: (row) => (
        <StackedCell
          primary={row.fullName || 'N/A'}
          secondary={row.email}
          tertiary={row.id}
        />
      ),
    },
    { 
      key: 'specialization', 
      header: 'Specialty',
      render: (row) => row.specialization || 'N/A'
    },
    { key: 'licenseNumber', header: 'License', render: (row) => row.licenseNumber || 'N/A' },
    {
      key: 'sittingHours',
      header: 'Sitting Hours',
      render: (row) =>
        row.sittingStart || row.sittingEnd
          ? `${row.sittingStart || ''} - ${row.sittingEnd || ''}`.trim()
          : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          children={row.status || 'unknown'}
          variant={String(row.status).toLowerCase() === 'active' ? 'info' : 'warning'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          className="px-3 py-1 text-xs font-semibold rounded-md border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
          onClick={(event) => {
            event.stopPropagation();
            void handleRemoveDoctor(row.id);
          }}
        >
          Remove
        </button>
      ),
    },
  ];

  return (
    <>
      {error && <p className='text-xs text-red-500 mb-2'>{error}</p>}

      <Table columns={doctorColumns} data={doctors as any} itemsPerPage={10} loading={loading} />
    </>
  );
};

export default AssociatedDoctorsList;
