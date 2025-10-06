import { useEffect, useState } from "react";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { type HospitalAssociationRequest } from "../../models/HospitalAssociationRequest";
import StatusCodes from "../../constants/StatusCodes";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import AssociationRequestCard from "./components/AssociationRequestCard";

function AssociationRequestsPage() {
  const role = useUserRole();

  const [data, setData] = useState<HospitalAssociationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hospitalId, setHospitalId] = useState<number | null>(null);

  const isHospitalStaff =
    role === ROLES.HOSPITAL_ADMIN ||
    role === ROLES.HOSPITAL_SUB_ADMIN ||
    role === ROLES.HOSPITAL_FRONT_DESK;

  const isPersonRole = role === ROLES.DOCTOR || role === ROLES.MEDICAL_CODER;

  // Fetch hospital ID for hospital staff
  useEffect(() => {
    const fetchHospitalId = async () => {
      if (isHospitalStaff) {
        try {
          const res = await api.get(EndPoints.hospitalStaff.get);
          const staffData = res.data.data;

          if (staffData.hospital_id) {
            setHospitalId(staffData.hospital_id);
          } else {
            setError("Could not retrieve hospital information");
          }
        } catch (err: any) {
          setError(
            err.response?.data?.message ||
              "Failed to fetch hospital information"
          );
        }
      }
    };

    if (role) {
      fetchHospitalId();
    }
  }, [role, isHospitalStaff]);

  // Fetch association requests
  const fetchRequests = async () => {
    // Don't fetch if hospital staff and no hospital ID yet
    if (isHospitalStaff && !hospitalId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      let endpoint = "";

      if (isPersonRole) {
        // Doctors and medical coders view requests sent to them
        endpoint = EndPoints.hospitalAssociationRequest.person;
      } else if (isHospitalStaff && hospitalId) {
        // Hospital staff view requests they created
        endpoint = `${EndPoints.hospitalAssociationRequest.hospital}${hospitalId}`;
      }

      if (!endpoint) {
        setError("Invalid role for viewing association requests");
        setLoading(false);
        return;
      }

      const res = await api.get(endpoint);
      setData(res.data.data || []);
    } catch (err: any) {
      if (err.response?.status === StatusCodes.NOT_FOUND) {
        setData([]);
      } else {
        setError(
          err.response?.data?.message || "Failed to load association requests"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests after hospital ID is loaded (for hospital staff) or immediately (for persons)
  useEffect(() => {
    if (role && (isPersonRole || (isHospitalStaff && hospitalId))) {
      fetchRequests();
    }
  }, [role, hospitalId, isPersonRole, isHospitalStaff]);

  const handleApprove = async (requestId: number) => {
    try {
      await api.put(
        `${EndPoints.hospitalAssociationRequest.approve}${requestId}`
      );
      setSuccess("Association request approved successfully!");
      setTimeout(() => setSuccess(""), 3000);

      // Refetch data
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async (requestId: number) => {
    if (!window.confirm("Are you sure you want to reject this request?")) {
      return;
    }

    try {
      await api.delete(
        `${EndPoints.hospitalAssociationRequest.delete}${requestId}`
      );
      setSuccess("Association request rejected successfully!");

      // Refetch data
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject request");
    }
  };

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

  if (!role || (isHospitalStaff && loading && !hospitalId)) {
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
      {!loading && data.length === 0 && (
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
      {!loading && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((request) => (
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
