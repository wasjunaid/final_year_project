import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCheck, FaTimes, FaTrash, FaEye } from "react-icons/fa";
import { useEHRAccess } from "../../hooks/useEHRAccess";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import ROUTES  from "../../constants/routes";
import Button from "../../components/Button";
import type { EHRAccess } from "../../models/EHRAccess";

function EHRAccessRequestsPage() {
  const navigate = useNavigate();
  const role = useUserRole();
  const {
    accesses,
    loading,
    error,
    success,
    getForDoctor,
    getForPatient,
    grantByPatient,
    denyByPatient,
    revoke,
    clearMessages
  } = useEHRAccess();

  const isDoctor = role === ROLES.DOCTOR;
  const isPatient = role === ROLES.PATIENT;

  // Fetch requests based on user role
  useEffect(() => {
    const fetchRequests = async () => {
      if (isDoctor) {
        await getForDoctor();
      } else if (isPatient) {
        await getForPatient();
      }
    };

    if (role) {
      fetchRequests();
    }
  }, [role, isDoctor, isPatient, getForDoctor, getForPatient]);

  const handleGrant = async (ehr_access_id: number) => {
    await grantByPatient(ehr_access_id);
  };

  const handleDeny = async (ehr_access_id: number) => {
    if (!window.confirm("Are you sure you want to deny this access request?")) {
      return;
    }
    await denyByPatient(ehr_access_id);
  };

  const handleRevoke = async (ehr_access_id: number) => {
    if (!window.confirm("Are you sure you want to revoke this access?")) {
      return;
    }
    await revoke(ehr_access_id);
  };

  const handleViewEHR = (access: EHRAccess) => {
    // Navigate to EHR details page with patient info
    navigate(ROUTES.EHR_DETAILS, { 
      state: { 
        patient_id: access.patient_id,
        patient_name: access.patient_name,
        patient_email: access.patient_email
      } 
    });
  };

  const getStatusColor = (status: EHRAccess['status']): string => {
    switch (status) {
      case 'APPROVED':
      case 'GRANTED': // Added GRANTED
        return 'text-green-600 bg-green-50 border-green-200';
      case 'DENIED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING':
      case 'REQUESTED':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearMessages]);

  // Restrict access to only allowed roles
  if (role && !isDoctor && !isPatient) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Access Denied</p>
            <p>You don't have permission to view EHR access requests</p>
          </div>
        </div>
      </div>
    );
  }

  if (!role || loading) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EHR Access Requests</h1>
        {isDoctor && (
          <Button
            label="Request Access"
            icon={<FaPlus />}
            onClick={() => navigate(ROUTES.CREATE_EHR_ACCESS_REQUEST)}
          />
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Empty State */}
      {!loading && accesses.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg mb-2">
            {isDoctor
              ? "No access requests sent"
              : "No access requests received"}
          </p>
          <p className="text-sm mb-4">
            {isDoctor
              ? "You haven't requested access to any patient's EHR yet."
              : "You haven't received any EHR access requests yet."}
          </p>
          {isDoctor && (
            <Button
              label="Request Access"
              icon={<FaPlus />}
              onClick={() => navigate(ROUTES.CREATE_EHR_ACCESS_REQUEST)}
            />
          )}
        </div>
      )}

      {/* Requests List */}
      {!loading && accesses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accesses.map((access) => (
            <div
              key={access.ehr_access_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {isDoctor 
                      ? (access.patient_name || `Patient ID: ${access.patient_id}`) 
                      : (access.doctor_name || `Doctor ID: ${access.doctor_id}`)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isDoctor ? access.patient_email : access.doctor_email}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                    access.status
                  )}`}
                >
                  {access.status}
                </span>
              </div>

              {access.message && (
                <div className="mb-3 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{access.message}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 mb-3">
                <p>Requested: {new Date(access.requested_at || access.created_at || '').toLocaleDateString()}</p>
                {access.responded_at && (
                  <p>Responded: {new Date(access.responded_at).toLocaleDateString()}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Doctor - View EHR if approved or granted */}
                {isDoctor && (access.status === 'APPROVED' || access.status === 'GRANTED') && (
                  <button
                    onClick={() => handleViewEHR(access)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    <FaEye /> View EHR
                  </button>
                )}

                {/* Patient - Grant/Deny if pending */}
                {isPatient && (access.status === 'PENDING' || access.status === 'REQUESTED') && (
                  <>
                    <button
                      onClick={() => handleGrant(access.ehr_access_id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <FaCheck /> Grant
                    </button>
                    <button
                      onClick={() => handleDeny(access.ehr_access_id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <FaTimes /> Deny
                    </button>
                  </>
                )}
                
                {/* Both - Revoke if approved or granted */}
                {(access.status === 'APPROVED' || access.status === 'GRANTED') && (
                  <button
                    onClick={() => handleRevoke(access.ehr_access_id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${isDoctor ? 'ml-2' : ''}`}
                    disabled={loading}
                  >
                    <FaTrash /> Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EHRAccessRequestsPage;