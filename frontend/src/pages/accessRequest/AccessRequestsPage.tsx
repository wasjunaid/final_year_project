import React, { useEffect } from 'react';
import Table, { type TableColumn } from '../../components/table';
import { StackedCell, Badge, ActionButtons } from '../../components/TableHelpers';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useDoctorAccessController } from '../../hooks/accessRequest/useDoctorAccessRequestController.instance';
import { usePatientAccessController } from '../../hooks/accessRequest/usePatientAccessRequestController.instance';
import accessRequestRepository from '../../repositories/accessRequest/accessRequestRepository';
import type { AccessRequestModel } from '../../models/accessRequest/model';
import { AccessRequestStatus } from '../../models/accessRequest';
import { useAuthController } from '../../hooks/auth';
import { ROLES } from '../../constants/profile';
import { useSidebarController } from '../../hooks/ui/sidebar';

const statusVariant = (status: AccessRequestStatus) => {
  switch ((status || '').toLowerCase()) {
    case AccessRequestStatus.granted:
      return 'success';
    case AccessRequestStatus.requested:
      return 'warning';
    case AccessRequestStatus.denied:
    case AccessRequestStatus.revoked:
      return 'danger';
    default:
      return 'info';
  }
};

const AccessRequestsPage: React.FC = () => {
  const { role } = useAuthController();
  if (role !== ROLES.DOCTOR && role !== ROLES.PATIENT) {
    return <Alert type="error" title="Access Denied" message="You do not have permission to view this page." />;
  }

  const { setConfig } = useNavbarController();

  useEffect(() => {
    // ensure this config is only rendered if role is patient, as doctor uses dashboard which has its own config
    if (role === ROLES.PATIENT) setConfig({title: "Access Requests"});
  }, []);

  const doctorController = useDoctorAccessController();
  const patientController = usePatientAccessController();

  const { requests, loading, error, success, fetchRequestsForDoctor, createRequest, cancelRequest } = doctorController;
  const { requests: patientRequests, loading: patientLoading, error: patientError, success: patientSuccess, fetchRequestsForPatient, acceptRequest, denyRequest, deleteRequest: patientDeleteRequest } = patientController;

  // removed fetch from controller and called here as patient is not supposed to call doctors controller and vice versa
  useEffect(()=>{
    if (role === ROLES.DOCTOR) {
      fetchRequestsForDoctor();
    }
    else if (role === ROLES.PATIENT) {
      fetchRequestsForPatient();
    }
  }, []);

  const handleView = (docId?: number | null) => {
    // View patient EHR when access has been granted. docId here may be documentId; prefer using patient id
    // The table row contains patient_id as patientId property (access request model)
    // This function will be re-bound below with the full row in render
    if (!docId) return;
    alert('Feature coming soon!');
  };

  // EHR viewer state
  const [ehrLoading, setEhrLoading] = React.useState(false);
  const [ehrError, setEhrError] = React.useState<string | null>(null);
  const [ehrData, setEhrData] = React.useState<any | null>(null);

  const { navigateToPage, setSelectedPatientId } = useSidebarController();

  const fetchAndShowEhr = async (patientId?: number | null) => {
    if (!patientId) return;
    // set selected patient id in sidebar store and navigate to dedicated page
    setSelectedPatientId(patientId);
    navigateToPage('ehr');
  };

  const renderDoctorActions = (row: any) => {
    const status = (row.status || '').toLowerCase();
    const buttons: any[] = [];

    if (status === AccessRequestStatus.requested) {
      buttons.push({ label: 'Cancel', variant: 'danger', onClick: async () => await cancelRequest(row.accessRequestId) });
    } else if (status === AccessRequestStatus.granted) {
      buttons.push({ label: 'View', variant: 'secondary', onClick: () => fetchAndShowEhr(row.patientId), disabled: !row.patientId });
      // buttons.push({ label: 'End', variant: 'danger', onClick: async () => await endRequest(row.accessRequestId) }); //TODO: Implement end request on backend and integrate
    } else if (status === AccessRequestStatus.denied || status === AccessRequestStatus.revoked) {
      buttons.push({ label: 'Renew', variant: 'primary', onClick: async () => await createRequest({ patient_email: row.patientEmail, document_id: row.documentId } as any) });
    }
    else {
      // Unkown status - leave empty
    }

    return <ActionButtons buttons={buttons} />;
  };
  
  const renderPatientActions = (row: any) => {
    const status = (row.status || '').toLowerCase();
    const buttons: any[] = [];

    // patient actions

    if (status === AccessRequestStatus.requested) {
      buttons.push(
        { label: 'Approve', variant: 'success', onClick: async () => await acceptRequest(row.accessRequestId) },
        { label: 'Deny', variant: 'danger', onClick: async () => await denyRequest(row.accessRequestId) }
      );
    } else if (status === AccessRequestStatus.granted) {
      buttons.push(
        { label: 'View', variant: 'secondary', onClick: () => handleView(row.documentId), disabled: !row.documentId },
        { label: 'Revoke', variant: 'danger', onClick: async () => await patientDeleteRequest(row.accessRequestId) }
      );
    } else if (status === AccessRequestStatus.denied || status === AccessRequestStatus.revoked) {
      buttons.push(
        // TODO: Implement Renew request feature from patient side (normally doctor always requests first)
        { label: 'Renew', variant: 'primary', onClick: async () => {/* await renewPatientRequest(row.acceptRequestId) */}, disabled: true }
      );
    } else {
      // unknown status - no actions
    }

    return <ActionButtons buttons={buttons} />;
  };

  const columns : TableColumn<AccessRequestModel>[] = [
    { 
      key: 'patient',
      header: role === ROLES.DOCTOR ? 'Patient' : "Requester",
      render: (r: any) => {
        return (
          <StackedCell
            primary={role === ROLES.DOCTOR ? r.patientName || r.patientEmail : r.doctorName || r.doctorEmail}
            secondary={role === ROLES.DOCTOR ? r.patientEmail : r.doctorEmail}
            tertiary={`Req ID: ${r.accessRequestId}`}
          />
        )
      }
    },
    // { key: 'document', header: 'Document', render: (r: any) => (r.documentId ?? 'Any') },
    { key: 'status', header: 'Status', render: (r: any) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
    { 
      key: 'createdAt',
      header: 'Created',
      hideOnMobile: true,
      render: (r: any) => {
        return (
          <StackedCell
            primary={r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
            secondary={r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          />
        )
      }
    },
    { key: 'actions', header: 'Actions', render: (r: any) => role === ROLES.DOCTOR ? renderDoctorActions(r) : renderPatientActions(r) },
  ];

  const tableData = role === ROLES.DOCTOR ? requests : patientRequests;
  const tableLoading = loading || patientLoading;
  const tableError = error || patientError;
  const tableSuccess = success || patientSuccess;

  return (
    <>
      {tableError && <Alert type="error" title="Error" message={tableError} className="mb-3" />}
      {tableSuccess && <Alert type="success" title="Success" message={tableSuccess} className="mb-3" />}

      <Table
        columns={columns}
        data={tableData}
        loading={tableLoading}
        itemsPerPage={10}
        emptyMessage="No access requests"
      />

      {/* EHR Viewer Panel for Doctor */}
      {ehrLoading && (
        <div className="mt-4">
          <Alert type="info" message="Loading EHR..." />
        </div>
      )}

      {ehrError && (
        <div className="mt-4">
          <Alert type="error" title="EHR Unavailable" message={ehrError} />
        </div>
      )}

      {ehrData && (
        <div className="mt-4 space-y-4">
          <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Patient EHR</h2>
            <p className="text-sm text-gray-600 mb-4">Verification: {ehrData.verification?.verified ? 'Verified' : 'Unverified'} — Source: {ehrData.verification?.verificationSource || 'N/A'}</p>

            {/* Patient summary */}
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

          {/* Appointment History table */}
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

          {/* Documents lists */}
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
    </>
  );
};

export default AccessRequestsPage;
