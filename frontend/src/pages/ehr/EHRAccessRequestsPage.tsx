import { useEffect } from "react";
import { useEHRAccess } from "../../hooks/useEHRAccess";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import type { EHRAccess } from "../../models/EHRAccess";

function EHRAccessRequestsPage() {
  const role = useUserRole();
  
  const { 
    ehrAccessRequests, 
    loading, 
    error, 
    success, 
    getForPatient, 
    getForDoctor, 
    grantByPatient, 
    denyByPatient, 
    revokeByPatient,
    clearMessages 
  } = useEHRAccess();

  const isPatient = role === ROLES.PATIENT;
  const isDoctor = role === ROLES.DOCTOR;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      if (isPatient) {
        await getForPatient();
      } else if (isDoctor) {
        await getForDoctor();
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      await grantByPatient(requestId);
      await fetchRequests();
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDeny = async (requestId: number) => {
    if (!window.confirm("Are you sure you want to deny this EHR access request?")) {
      return;
    }

    try {
      await denyByPatient(requestId);
      await fetchRequests();
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleRevoke = async (requestId: number) => {
    if (!window.confirm("Are you sure you want to revoke this approved EHR access?")) {
      return;
    }

    try {
      await revokeByPatient(requestId);
      await fetchRequests();
    } catch (err) {
      // Error handled by hook
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearMessages]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearMessages]);

  if (!isPatient && !isDoctor) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only patients and doctors can access EHR requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          EHR Access Requests
        </h1>
        <p className="text-gray-600">
          {isPatient 
            ? "Manage access requests from doctors"
            : "View your EHR access requests to patients"
          }
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading EHR requests...</div>
        </div>
      ) : ehrAccessRequests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No EHR access requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ehrAccessRequests.map((request: EHRAccess) => (
            <div key={request.ehr_access_id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isPatient ? request.doctor_name : request.patient_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isPatient ? "Doctor" : "Patient"}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === "GRANTED" 
                    ? "bg-green-100 text-green-800"
                    : request.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>Request Date: {new Date(request.created_at).toLocaleDateString()}</p>
                {request.granted_at && (
                  <p>Granted: {new Date(request.granted_at).toLocaleDateString()}</p>
                )}
              </div>

              {isPatient && request.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.ehr_access_id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDeny(request.ehr_access_id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={loading}
                  >
                    Deny
                  </button>
                </div>
              )}

              {isPatient && request.status === "GRANTED" && (
                <button
                  onClick={() => handleRevoke(request.ehr_access_id)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  disabled={loading}
                >
                  Revoke Access
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EHRAccessRequestsPage;
