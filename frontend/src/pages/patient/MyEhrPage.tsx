import React, { useEffect, useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import type { NavbarConfig } from '../../models/navbar/model';
import type { TableColumn } from '../../components/table';
import Table from '../../components/table';
import Alert from '../../components/Alert';
import { useMedicalHistoryController } from '../../hooks/patient/useMedicalHistoryController.instance';
import { useAllergyController } from '../../hooks/patient/useAllergyController.instance';
import { useFamilyHistoryController } from '../../hooks/patient/useFamilyHistoryController.instance';
import { useSurgicalHistoryController } from '../../hooks/patient/useSurgicalHistoryController.instance';
import type { MedicalHistory } from '../../models/patient/medicalHistory/model';
import type { Allergy } from '../../models/patient/allergy/model';
import type { FamilyHistory } from '../../models/patient/familyHistory/model';
import type { SurgicalHistory } from '../../models/patient/surgicalHistory/model';

const MyEhrPage: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'My Medical Records',
    subtitle: 'View your complete Electronic Health Record',
    tabs: [
      { label: 'Medical History', value: 'medical-history' },
      { label: 'Allergies', value: 'allergies' },
      { label: 'Family History', value: 'family-history' },
      { label: 'Surgical History', value: 'surgical-history' },
    ],
  }), []);

  const { activeTab = 'medical-history' } = useNavbarController(navbarConfig);

  const medicalHistoryController = useMedicalHistoryController();
  const allergyController = useAllergyController();
  const familyHistoryController = useFamilyHistoryController();
  const surgicalHistoryController = useSurgicalHistoryController();

  // Fetch all patient history on mount
  useEffect(() => {
    medicalHistoryController.fetchMedicalHistoryForPatient();
    allergyController.fetchAllergiesForPatient();
    familyHistoryController.fetchFamilyHistoryForPatient();
    surgicalHistoryController.fetchSurgicalHistoryForPatient();
  }, []);

  // Medical History columns
  const medicalHistoryColumns: TableColumn<MedicalHistory>[] = [
    { key: 'conditionName', header: 'Condition', render: (row) => row.conditionName },
    { 
      key: 'diagnosisDate', 
      header: 'Diagnosis Date', 
      render: (row) => row.diagnosisDate ? new Date(row.diagnosisDate).toLocaleDateString() : '-' 
    },
    { 
      key: 'createdAt', 
      header: 'Added On', 
      hideOnMobile: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' 
    },
  ];

  // Allergy columns
  const allergyColumns: TableColumn<Allergy>[] = [
    { key: 'allergyName', header: 'Allergy', render: (row) => row.allergyName },
    { 
      key: 'createdAt', 
      header: 'Added On', 
      hideOnMobile: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' 
    },
  ];

  // Family History columns
  const familyHistoryColumns: TableColumn<FamilyHistory>[] = [
    { key: 'conditionName', header: 'Condition', render: (row) => row.conditionName },
    { 
      key: 'createdAt', 
      header: 'Added On', 
      hideOnMobile: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' 
    },
  ];

  // Surgical History columns
  const surgicalHistoryColumns: TableColumn<SurgicalHistory>[] = [
    { key: 'surgeryName', header: 'Surgery', render: (row) => row.surgeryName },
    { 
      key: 'surgeryDate', 
      header: 'Surgery Date', 
      render: (row) => row.surgeryDate ? new Date(row.surgeryDate).toLocaleDateString() : '-' 
    },
    { 
      key: 'createdAt', 
      header: 'Added On', 
      hideOnMobile: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' 
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {activeTab === 'medical-history' && (
        <div>
          {medicalHistoryController.error && (
            <Alert type="error" title="Error" message={medicalHistoryController.error} className="mb-4" />
          )}
          <Table
            columns={medicalHistoryColumns}
            data={medicalHistoryController.medicalHistory}
            loading={medicalHistoryController.loading}
            itemsPerPage={10}
            emptyMessage="No medical history records found"
          />
        </div>
      )}
      {activeTab === 'allergies' && (
        <div>
          {allergyController.error && (
            <Alert type="error" title="Error" message={allergyController.error} className="mb-4" />
          )}
          <Table
            columns={allergyColumns}
            data={allergyController.allergies}
            loading={allergyController.loading}
            itemsPerPage={10}
            emptyMessage="No allergy records found"
          />
        </div>
      )}
      {activeTab === 'family-history' && (
        <div>
          {familyHistoryController.error && (
            <Alert type="error" title="Error" message={familyHistoryController.error} className="mb-4" />
          )}
          <Table
            columns={familyHistoryColumns}
            data={familyHistoryController.familyHistory}
            loading={familyHistoryController.loading}
            itemsPerPage={10}
            emptyMessage="No family history records found"
          />
        </div>
      )}
      {activeTab === 'surgical-history' && (
        <div>
          {surgicalHistoryController.error && (
            <Alert type="error" title="Error" message={surgicalHistoryController.error} className="mb-4" />
          )}
          <Table
            columns={surgicalHistoryColumns}
            data={surgicalHistoryController.surgicalHistory}
            loading={surgicalHistoryController.loading}
            itemsPerPage={10}
            emptyMessage="No surgical history records found"
          />
        </div>
      )}
    </div>
  );
};

export default MyEhrPage;
