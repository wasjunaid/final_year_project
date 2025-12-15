import React from 'react';
import Table from '../../../components/Table';
import Alert from '../../../components/Alert';
import type { HospitalModel } from '../../../models/hospital';
import { useHospitalController } from '../../../hooks/hospital';

export const HospitalsList: React.FC = () => {
  const { hospitals, loading, error, clearMessages } = useHospitalController();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearMessages}
          className="mb-6"
        />
      )}

      <Table
        columns={[
          {
            key: 'hospital_id',
            header: 'ID',
            render: (hospital: HospitalModel) => hospital.hospital_id,
          },
          {
            key: 'name',
            header: 'Hospital Name',
            render: (hospital: HospitalModel) => (
              <span className="font-medium">{hospital.name}</span>
            ),
          },
          {
            key: 'created_at',
            header: 'Registration Date',
            render: (hospital: HospitalModel) => formatDate(hospital.created_at),
          },
          {
            key: 'updated_at',
            header: 'Last Updated',
            render: (hospital: HospitalModel) => formatDate(hospital.updated_at),
          },
        ]}
        data={hospitals}
        loading={loading}
        itemsPerPage={10}
        emptyMessage="No hospitals found"
      />
    </>
  );
};
