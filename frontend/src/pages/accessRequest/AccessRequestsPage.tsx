import React, { useEffect } from 'react';
import Table, { type TableColumn } from '../../components/table';
import { StackedCell, Badge, ActionButtons } from '../../components/TableHelpers';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useDoctorAccessController } from '../../hooks/accessRequest/useDoctorAccessRequestController.instance';
import { usePatientAccessController } from '../../hooks/accessRequest/usePatientAccessRequestController.instance';
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

  // TODO: Patient's own EHR view - currently shows alert, needs proper implementation
  const handleViewOwnEhr = () => {
    // View patient's own EHR when access has been granted by the patient
    // TODO: Implement patient's own EHR viewing functionality
    // This should navigate to a patient EHR view page showing the patient's own medical records
    // WORKAROUND: Patient can view their own EHR via "My EHR" in the sidebar navigation
    alert('Feature coming soon! Patient EHR view needs to be implemented.\n\nWorkaround: You can view your complete medical records by clicking "My EHR" in the sidebar navigation.');
  };

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
        // TODO: Implement patient's own EHR view - currently shows alert
        { label: 'View', variant: 'secondary', onClick: () => handleViewOwnEhr(), disabled: !row.documentId },
        { label: 'Revoke', variant: 'danger', onClick: async () => await patientDeleteRequest(row.accessRequestId) }
      );
    } else if (status === AccessRequestStatus.denied || status === AccessRequestStatus.revoked) {
      // TODO: Implement Renew request feature from patient side (normally doctor always requests first)
      // This button is currently disabled and non-functional
      buttons.push(
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
    </>
  );
};

export default AccessRequestsPage;
