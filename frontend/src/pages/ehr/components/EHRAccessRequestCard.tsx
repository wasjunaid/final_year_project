import { FaBan, FaCheck, FaClock, FaTimes, FaEye } from "react-icons/fa";
import { ROLES } from "../../../constants/roles";
import type { EHRAccessRequest } from "../../../models/EHRAccessRequest";

export interface EHRAccessRequestCardProps {
  request: EHRAccessRequest;
  userRole: string;
  onApprove: (requestId: number) => void;
  onDeny: (requestId: number) => void;
  onRevoke: (requestId: number) => void;
  onViewEHR?: (patientId: number, patientName: string) => void;
}

export function EHRAccessRequestCard({
  request,
  userRole,
  onApprove,
  onDeny,
  onRevoke,
  onViewEHR,
}: EHRAccessRequestCardProps) {
  const isPatient = userRole === ROLES.PATIENT;
  const isDoctor = userRole === ROLES.DOCTOR;
  const isPending =
    request.status === "requested" || request.status === "re-requested";
  const isApproved = request.status === "approved";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              request.status === "approved"
                ? "bg-green-100"
                : request.status === "denied"
                ? "bg-red-100"
                : "bg-yellow-100"
            }`}
          >
            {/* Add status icon */}
            {request.status === "approved" ? (
              <FaCheck className="text-green-600" />
            ) : request.status === "denied" ? (
              <FaTimes className="text-red-600" />
            ) : (
              <FaClock className="text-yellow-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {isPatient
                ? `Dr. ${request.doctor_first_name} ${request.doctor_last_name}`
                : `${request.patient_first_name} ${request.patient_last_name}`}
            </h3>
            <p className="text-sm text-gray-600">
              {isPatient ? request.doctor_email : request.patient_email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${
              request.status === "approved"
                ? "bg-green-100 text-green-800"
                : request.status === "denied"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {request.status}
          </span>

          {/* Action buttons for patients */}
          {isPatient && (
            <div className="flex gap-1">
              {isPending && (
                <>
                  <button
                    onClick={() => onApprove(request.ehr_access_request_id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Approve Request"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => onDeny(request.ehr_access_request_id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Deny Request"
                  >
                    <FaTimes />
                  </button>
                </>
              )}
              {/* Add revoke button for approved requests */}
              {isApproved && (
                <button
                  onClick={() => onRevoke(request.ehr_access_request_id)}
                  className="p-1 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                  title="Revoke Access"
                >
                  <FaBan />
                </button>
              )}
            </div>
          )}

          {/* View EHR button for doctors when access is approved */}
          {isDoctor && isApproved && onViewEHR && (
            <div className="flex gap-1">
              <button
                onClick={() =>
                  onViewEHR(
                    request.patient_id,
                    `${request.patient_first_name} ${request.patient_last_name}`
                  )
                }
                className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="View Patient EHR"
              >
                <FaEye />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          <span className="font-medium">Requested:</span>{" "}
          {new Date(request.created_at).toLocaleDateString()}
        </p>
        {request.updated_at !== request.created_at && (
          <p>
            <span className="font-medium">Updated:</span>{" "}
            {new Date(request.updated_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Show status-specific information */}
      {isApproved && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-700">
            <span className="font-medium">✓ Access Granted:</span>{" "}
            {isPatient
              ? "This doctor can now access your EHR data"
              : isDoctor
              ? "You can now view this patient's EHR data"
              : "Access has been granted"}
          </p>

          {/* ← Add additional info for doctors */}
          {isDoctor && (
            <p className="text-xs text-blue-700 mt-1">
              Click the eye icon above to view the patient's complete medical
              record.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
