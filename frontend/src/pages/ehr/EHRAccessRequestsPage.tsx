import { useEffect, useState } from "react";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import type { EHRAccessRequest } from "../../models/EHRAccessRequest";
import { EHRAccessRequestCard } from "./components/EHRAccessRequestCard";
import EHRPage from "./EHRPage"; // ← Import EHRPage

function EHRAccessRequestsPage() {
  const role = useUserRole();
  const [requests, setRequests] = useState<EHRAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ← Add state for EHR viewing
  const [viewingEHR, setViewingEHR] = useState<{
    patientId: number;
    patientName: string;
  } | null>(null);

  const isPatient = role === ROLES.PATIENT;
  const isDoctor = role === ROLES.DOCTOR;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = isPatient
        ? EndPoints.ehrAccessRequest.patient
        : EndPoints.ehrAccessRequest.doctor;

      const response = await api.get(endpoint);
      setRequests(response.data.data || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setRequests([]);
        return;
      }
      setError(
        err.response?.data?.message || "Failed to load EHR access requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      await api.put(`${EndPoints.ehrAccessRequest.approve}/${requestId}`);
      setSuccess("EHR access request approved successfully");
      fetchRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve request");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeny = async (requestId: number) => {
    if (
      !window.confirm("Are you sure you want to deny this EHR access request?")
    ) {
      return;
    }

    try {
      //TODO: change to deny endpoint when available
      await api.put(`${EndPoints.ehrAccessRequest.revoke}/${requestId}`);
      setSuccess("EHR access request denied successfully");
      fetchRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to deny request");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleRevoke = async (requestId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this approved EHR access? The doctor will lose access to your medical records."
      )
    ) {
      return;
    }

    try {
      await api.put(`${EndPoints.ehrAccessRequest.revoke}/${requestId}`);
      setSuccess("EHR access revoked successfully");
      fetchRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to revoke access");
      setTimeout(() => setError(""), 3000);
    }
  };

  // handler for viewing EHR
  const handleViewEHR = (patientId: number, patientName: string) => {
    setViewingEHR({ patientId, patientName });
  };

  // handler to go back to requests list
  const handleBackToRequests = () => {
    setViewingEHR(null);
  };

  // Access control: only patients and doctors can access this page
  if (!isPatient && !isDoctor) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only patients and doctors can manage EHR access requests</p>
        </div>
      </div>
    );
  }

  // Show EHR page when viewing patient EHR
  if (viewingEHR) {
    return (
      <div className="flex flex-col h-full">
        {/* Back button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleBackToRequests}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-dark transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Access Requests</span>
          </button>
        </div>

        {/* EHR Page */}
        <div className="flex-1">
          <EHRPage patientId={viewingEHR.patientId} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          EHR Access Requests
        </h1>
        <p className="text-gray-600 text-sm">
          {isPatient
            ? "Review and respond to EHR access requests from doctors"
            : "View your sent EHR access requests and their status"}
        </p>
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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading access requests...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <FaPaperPlane className="mx-auto text-4xl mb-4 text-gray-300" />
          <p className="text-lg mb-2">No EHR access requests found</p>
          <p className="text-sm">
            {isPatient
              ? "No doctors have requested access to your EHR yet"
              : "You haven't sent any EHR access requests yet"}
          </p>
        </div>
      )}

      {/* Request Cards */}
      {!loading && requests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <EHRAccessRequestCard
              key={request.ehr_access_request_id}
              request={request}
              userRole={role}
              onApprove={handleApprove}
              onDeny={handleDeny}
              onRevoke={handleRevoke}
              onViewEHR={handleViewEHR}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EHRAccessRequestsPage;
