import React, { useEffect, useMemo } from 'react';
import Table from '../../components/Table';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useSidebarController } from '../../hooks/ui/sidebar';
import accessRequestRepository from '../../repositories/accessRequest/accessRequestRepository';
import { ArrowLeft } from 'lucide-react';
import type { NavbarConfig } from '../../models/navbar/model';

const PatientEhrPage: React.FC = () => {
  const { selectedPatientId, navigateToPage, setSelectedPatientId } = useSidebarController();
  const [ehrData, setEhrData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
          setError('EHR not available or access not granted for this patient.');
          setEhrData(null);
        } else {
          setEhrData(data);
        }
      } catch (err: any) {
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

  return (
    <div className="p-6 space-y-6">
      {error && <Alert type="error" title="EHR Unavailable" message={error} />}

      {ehrData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Patient EHR</h2>
            <p className="text-sm text-gray-600 mb-4">Verification: {ehrData.verification?.verified ? 'Verified' : 'Unverified'} — Source: {ehrData.verification?.verificationSource || 'N/A'}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Allergies</p>
                {Array.isArray(ehrData.data?.allergies) && ehrData.data.allergies.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {ehrData.data.allergies.map((a: any, i: number) => <li key={i}>{a.allergy_name}</li>)}
                  </ul>
                ) : <p className="text-sm text-gray-500">None recorded</p>}
              </div>

              <div>
                <p className="text-sm text-gray-500">Medical History</p>
                {Array.isArray(ehrData.data?.medicalHistory) && ehrData.data.medicalHistory.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {ehrData.data.medicalHistory.map((m: any, i: number) => <li key={i}>{m.condition_name} {m.diagnosis_date ? `— ${new Date(m.diagnosis_date).toLocaleDateString()}` : ''}</li>)}
                  </ul>
                ) : <p className="text-sm text-gray-500">None recorded</p>}
              </div>

              <div>
                <p className="text-sm text-gray-500">Current Prescriptions</p>
                {Array.isArray(ehrData.data?.currentPrescriptions) && ehrData.data.currentPrescriptions.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {ehrData.data.currentPrescriptions.map((p: any, i: number) => <li key={i}>{p.medicine_name || 'Unknown medicine'} — {p.dosage || ''} {p.instruction ? `(${p.instruction})` : ''}</li>)}
                  </ul>
                ) : <p className="text-sm text-gray-500">None recorded</p>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment History</h3>
            {Array.isArray(ehrData.data?.appointmentHistory) && ehrData.data.appointmentHistory.length > 0 ? (
              <Table
                columns={[
                  { key: 'date', header: 'Date', render: (r: any) => r.date || '-' },
                  { key: 'time', header: 'Time', render: (r: any) => r.time || '-' },
                  { key: 'status', header: 'Status', render: (r: any) => r.status || '-' },
                  { key: 'diagnosis', header: 'Diagnosis', render: (r: any) => r.diagnosis || '-' },
                  { key: 'plan', header: 'Plan', render: (r: any) => r.plan || '-' },
                ]}
                data={ehrData.data.appointmentHistory}
                loading={false}
                itemsPerPage={5}
                emptyMessage="No appointments"
              />
            ) : (
              <p className="text-sm text-gray-500">No appointment history available.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
              <h4 className="font-semibold mb-2">Verified Documents</h4>
              {Array.isArray(ehrData.data?.verifiedDocuments) && ehrData.data.verifiedDocuments.length > 0 ? (
                <ul className="list-disc list-inside">
                  {ehrData.data.verifiedDocuments.map((d: any, i: number) => <li key={i}>{d.original_name} — {d.created_at}</li>)}
                </ul>
              ) : <p className="text-sm text-gray-500">None</p>}
            </div>

            <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
              <h4 className="font-semibold mb-2">Unverified Documents</h4>
              {Array.isArray(ehrData.data?.unverifiedDocuments) && ehrData.data.unverifiedDocuments.length > 0 ? (
                <ul className="list-disc list-inside">
                  {ehrData.data.unverifiedDocuments.map((d: any, i: number) => <li key={i}>{d.original_name} — {d.document_type || 'Unknown'}</li>)}
                </ul>
              ) : <p className="text-sm text-gray-500">None</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientEhrPage;
