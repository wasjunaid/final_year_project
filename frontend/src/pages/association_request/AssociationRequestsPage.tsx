import { useEffect, useState } from "react";
import { useHospitalAssociationRequest } from "../../hooks/useHospitalAssociationRequest";
import { useHospitalStaff } from "../../hooks/useHospitalStaff";
import { type HospitalAssociationRequest } from "../../models/HospitalAssociationRequest";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import AssociationRequestCard from "./components/AssociationRequestCard";

function AssociationRequestsPage() {
  const role = useUserRole();
  const { 
    requests, 
    loading, 
    error, 
    success, 
    getByPerson, 
    getByHospital, 
    approveRequest, 
    deleteByStaff, 
    deleteByPerson,
    clearMessages 
  } = useHospitalAssociationRequest();
  
  const { 
    staff, 
    loading: staffLoading, 
    getStaff 
  } = useHospitalStaff();

  const isHospitalStaff =
    role === ROLES.HOSPITAL_ADMIN ||
    role === ROLES.HOSPITAL_SUB_ADMIN ||
    role === ROLES.HOSPITAL_FRONT_DESK;

  const isPersonRole = role === ROLES.DOCTOR || role === ROLES.MEDICAL_CODER;

  // Fetch hospital staff data if needed
  useEffect(() => {
    const fetchData = async () => {
      if (isHospitalStaff) {
        try {
          await getStaff();
        } catch (err: any) {
          // Error is handled by the hook
        }
      }
    };

    if (role) {
      fetchData();
    }
  }, [role, isHospitalStaff, getStaff]);

  // Fetch requests based on user role
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (isPersonRole) {
          await getByPerson();
        } else if (isHospitalStaff) {
          await getByHospital();
        }
      } catch (err) {
        // Error is handled by the hook
      }
    };

    if (role) {
      fetchRequests();
    }
  }, [role, isPersonRole, isHospitalStaff, getByPerson, getByHospital]);

  const handleApprove = async (requestId: number) => {
    try {
      await approveRequest(requestId);
      // Refetch data after approval
      if (isPersonRole) {
        await getByPerson();
      } else if (isHospitalStaff) {
        await getByHospital();
      }
    } catch (err: any) {
      // Error is handled by the hook
    }
  };

  const handleReject = async (requestId: number) => {
    if (!window.confirm("Are you sure you want to reject this request?")) {
      return;
    }

    try {
      if (isHospitalStaff) {
        await deleteByStaff(requestId);
      } else {
        await deleteByPerson(requestId);
      }
      
      // Refetch data after deletion
      if (isPersonRole) {
        await getByPerson();
      } else if (isHospitalStaff) {
        await getByHospital();
      }
    } catch (err: any) {
      // Error is handled by the hook
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
  if (role && !isHospitalStaff && !isPersonRole) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Access Denied</p>
            <p>You don't have permission to view association requests</p>
          </div>
        </div>
      </div>
    );
  }

  if (!role || loading || staffLoading) {
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
      {error && <div className="mb-4 text-red-700 rounded-md">{error}</div>}

      {success && (
        <div className="mb-4 text-green-700 rounded-md">{success}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading requests...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg mb-2">
            {isPersonRole
              ? "No association requests found"
              : "No pending association requests"}
          </p>
          <p className="text-sm mb-4">
            {isPersonRole
              ? "You haven't received any association requests from hospitals yet."
              : "You haven't sent any association requests yet."}
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && requests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <AssociationRequestCard
              key={request.hospital_association_request_id}
              request={request}
              showActions={isPersonRole} // Only show actions for doctors/medical coders
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AssociationRequestsPage;
