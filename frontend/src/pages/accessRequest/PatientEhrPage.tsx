import React, { useEffect, useMemo } from 'react';
import Table, { type TableColumn } from '../../components/Table';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useSidebarController } from '../../hooks/ui/sidebar';
import accessRequestRepository from '../../repositories/accessRequest/accessRequestRepository';
import { ArrowLeft, Eye } from 'lucide-react';
import type { NavbarConfig } from '../../models/navbar/model';
import TabbedCard from '../../components/TabbedComponent';
import { EhrDocumentDetailsView } from './components/EhrDocumentDetailsView';

const PatientEhrPage: React.FC = () => {
  const { selectedPatientId, navigateToPage, setSelectedPatientId } = useSidebarController();
  const [ehrData, setEhrData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = React.useState<any | null>(null);
  const [activeTabBeforeDetails, setActiveTabBeforeDetails] = React.useState<string>('overview');

  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Patient EHR',
    subtitle: selectedPatientId ? `Patient ID: ${selectedPatientId}` : undefined,
    tabs: [],
    actions: [
      {
        label: 'Back',
        icon: ArrowLeft,
        onClick: () => {
          // clear selection and go back to access requests
          setSelectedPatientId(null);
          navigateToPage('access-requests');
        },
        variant: 'ghost',
      },
    ],
  }), [selectedPatientId, navigateToPage, setSelectedPatientId]);

  useNavbarController(navbarConfig);

  useEffect(() => {
    const load = async () => {
      if (!selectedPatientId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await accessRequestRepository.fetchPatientEhr(selectedPatientId);
        if (!data) {
          console.error("PatientEhrPage - data is null/undefined, showing error");
          setError('EHR not available or access not granted for this patient.');
          setEhrData(null);
        } else {
          setEhrData(data);
        }
      } catch (err: any) {
        console.error("PatientEhrPage - error loading EHR:", err);
        setError(err?.message || 'Failed to load EHR');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedPatientId]);

  if (!selectedPatientId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold">No patient selected</h3>
          <p className="text-gray-600">Select a request and click View to open the patient EHR.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading EHR...</p>
        </div>
      </div>
    );
  }

  // Define table columns
  const medicalHistoryColumns: TableColumn<any>[] = [
    { 
      key: 'conditionName', 
      header: 'Condition', 
      render: (row) => row.condition_name || '-' 
    },
    { 
      key: 'diagnosisDate', 
      header: 'Diagnosis Date', 
      render: (row) => row.diagnosis_date ? new Date(row.diagnosis_date).toLocaleDateString() : '-' 
    },
  ];

  const allergyColumns: TableColumn<any>[] = [
    { 
      key: 'allergyName', 
      header: 'Allergy', 
      render: (row) => row.allergy_name || '-' 
    },
  ];

  const familyHistoryColumns: TableColumn<any>[] = [
    { 
      key: 'conditionName', 
      header: 'Condition', 
      render: (row) => row.condition_name || '-' 
    },
  ];

  const surgicalHistoryColumns: TableColumn<any>[] = [
    { 
      key: 'surgeryName', 
      header: 'Surgery', 
      render: (row) => row.surgery_name || '-' 
    },
    { 
      key: 'surgeryDate', 
      header: 'Surgery Date', 
      render: (row) => row.surgery_date ? new Date(row.surgery_date).toLocaleDateString() : '-' 
    },
  ];

  const prescriptionColumns: TableColumn<any>[] = [
    { 
      key: 'medicineName', 
      header: 'Medicine', 
      render: (row) => row.medicine_name || 'Not specified' 
    },
    { 
      key: 'dosage', 
      header: 'Dosage', 
      render: (row) => row.dosage || '-' 
    },
    { 
      key: 'instruction', 
      header: 'Instructions', 
      render: (row) => row.instruction || '-' 
    },
    { 
      key: 'prescriptionDate', 
      header: 'Prescribed On',
      hideOnMobile: true,
      render: (row) => row.prescription_date ? new Date(row.prescription_date).toLocaleDateString() : '-' 
    },
  ];

  const appointmentColumns: TableColumn<any>[] = [
    { 
      key: 'date', 
      header: 'Date', 
      render: (row) => row.date || '-' 
    },
    { 
      key: 'time', 
      header: 'Time', 
      render: (row) => row.time || '-' 
    },
    { 
      key: 'reason', 
      header: 'Reason', 
      render: (row) => row.reason || '-' 
    },
    { 
      key: 'diagnosis', 
      header: 'Diagnosis', 
      render: (row) => row.diagnosis || '-' 
    },
    { 
      key: 'status', 
      header: 'Status',
      hideOnMobile: true,
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {row.status || '-'}
        </span>
      )
    },
  ];

  const handleViewDocument = (document: any, currentTab: string) => {
    setActiveTabBeforeDetails(currentTab);
    setSelectedDocument(document);
  };

  const handleBackFromDocument = () => {
    setSelectedDocument(null);
  };

  const documentColumns: TableColumn<any>[] = [
    { 
      key: 'originalName', 
      header: 'Document Name', 
      render: (row) => row.original_name || '-' 
    },
    { 
      key: 'documentType', 
      header: 'Type', 
      render: (row) => row.document_type || '-' 
    },
    { 
      key: 'createdAt', 
      header: 'Uploaded On',
      hideOnMobile: true,
      render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row, _index, currentTab) => (
        <button
          onClick={() => handleViewDocument(row, currentTab || 'documents')}
          className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      )
    },
  ];

  // Define tabs
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-4">
          {/* Verification Status */}
          {ehrData?.verification && (
            <div className={`p-4 rounded-lg ${
              ehrData.verification.verified 
                ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${
                  ehrData.verification.verified ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  {ehrData.verification.verified ? '✓ Verified' : '⚠ Unverified'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  • Source: {ehrData.verification.verificationSource || 'N/A'}
                </span>
              </div>
              {ehrData.verification.verificationTimestamp && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Verified at: {new Date(ehrData.verification.verificationTimestamp).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Patient Info */}
          {ehrData?.data?.patient && (
            <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Blood Group</p>
                  <p className="font-medium">{ehrData.data.patient.blood_group || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Smoking</p>
                  <p className="font-medium capitalize">{ehrData.data.patient.smoking || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Alcohol</p>
                  <p className="font-medium capitalize">{ehrData.data.patient.alcohol || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drug Use</p>
                  <p className="font-medium capitalize">{ehrData.data.patient.drug_use || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Contact</p>
                  <p className="font-medium">
                    {ehrData.data.patient.emergency_contact_country_code} {ehrData.data.patient.emergency_contact_number}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-4">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Medical Conditions</h4>
              <p className="text-2xl font-bold">{ehrData?.data?.medicalHistory?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-4">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Known Allergies</h4>
              <p className="text-2xl font-bold">{ehrData?.data?.allergies?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-4">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Surgeries</h4>
              <p className="text-2xl font-bold">{ehrData?.data?.surgicalHistory?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-4">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Appointments</h4>
              <p className="text-2xl font-bold">{ehrData?.data?.appointmentHistory?.length || 0}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'medical-history',
      label: 'Medical History',
      content: (
        <Table
          columns={medicalHistoryColumns}
          data={ehrData?.data?.medicalHistory || []}
          loading={false}
          elevated={false}
          itemsPerPage={10}
          emptyMessage="No medical history records found"
        />
      ),
    },
    {
      id: 'allergies',
      label: 'Allergies',
      content: (
        <Table
          columns={allergyColumns}
          data={ehrData?.data?.allergies || []}
          loading={false}
          elevated={false}
          itemsPerPage={10}
          emptyMessage="No allergy records found"
        />
      ),
    },
    {
      id: 'family-history',
      label: 'Family History',
      content: (
        <Table
          columns={familyHistoryColumns}
          data={ehrData?.data?.familyHistory || []}
          loading={false}
          elevated={false}
          itemsPerPage={10}
          emptyMessage="No family history records found"
        />
      ),
    },
    {
      id: 'surgical-history',
      label: 'Surgical History',
      content: (
        <Table
          columns={surgicalHistoryColumns}
          data={ehrData?.data?.surgicalHistory || []}
          loading={false}
          elevated={false}
          itemsPerPage={10}
          emptyMessage="No surgical history records found"
        />
      ),
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      content: (
        <Table
          columns={prescriptionColumns}
          data={ehrData?.data?.currentPrescriptions || []}
          loading={false}
          elevated={false}
          itemsPerPage={10}
          emptyMessage="No prescription records found"
        />
      ),
    },
    {
      id: 'appointments',
      label: 'Appointments',
      content: (
        <Table
          columns={appointmentColumns}
          data={ehrData?.data?.appointmentHistory || []}
          loading={false}
          elevated={false}
          itemsPerPage={10}
          emptyMessage="No appointment records found"
        />
      ),
    },
    {
      id: 'verified-documents',
      label: 'Verified Documents',
      content: (
        <Table
          columns={documentColumns}
          data={ehrData?.data?.verifiedDocuments || []}
          loading={false}
          elevated={false}
          itemsPerPage={10}
          emptyMessage="No verified documents found"
          currentTab="verified-documents"
        />
      ),
    },
    {
      id: 'unverified-documents',
      label: 'Unverified Documents',
      content: (
        <div className='flex flex-1 flex-col min-h-full'>
          <Table
            columns={documentColumns}
            data={ehrData?.data?.unverifiedDocuments || []}
            loading={false}
            elevated={false}
            itemsPerPage={10}
            emptyMessage="No unverified documents found"
            currentTab="unverified-documents"
          />
        </div>
      ),
    },
  ];

  // If viewing document details, show that view
  if (selectedDocument) {
    return (
      <EhrDocumentDetailsView
        document={selectedDocument}
        onBack={handleBackFromDocument}
      />
    );
  }

  return (
    <div className='flex flex-1 min-h-full'>
      {error && <Alert type="error" title="EHR Unavailable" message={error} className="mb-4" />}

      {ehrData && (
        <TabbedCard tabs={tabs} defaultTab={activeTabBeforeDetails} />
      )}

      {!error && !ehrData && !loading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600">No EHR data available.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientEhrPage;
