import {
  FaCheck,
  FaTimes,
  FaUser,
  FaHospital,
  FaCalendar,
  FaUserMd,
} from "react-icons/fa";
import { type HospitalAssociationRequest } from "../../../models/HospitalAssociationRequest";

interface AssociationRequestCardProps {
  request: HospitalAssociationRequest;
  showActions?: boolean;
  onApprove?: (requestId: number) => void;
  onReject?: (requestId: number) => void;
}

function AssociationRequestCard({
  request,
  showActions = false,
  onApprove,
  onReject,
}: AssociationRequestCardProps) {
  const handleApprove = () => {
    if (onApprove) {
      onApprove(request.hospital_association_request_id);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(request.hospital_association_request_id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            {request.role === "doctor" ? (
              <FaUserMd className="text-blue-600" />
            ) : (
              <FaUser className="text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Request #{request.hospital_association_request_id}
            </h3>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
              {request.role}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Approve"
            >
              <FaCheck />
            </button>
            <button
              onClick={handleReject}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Reject"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Person Info (for hospital staff view) */}
        {request.person_email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUser className="text-gray-400" />
            <span>
              {request.person_first_name && request.person_last_name
                ? `${request.person_first_name} ${request.person_last_name}`
                : "N/A"}
            </span>
            <span className="text-gray-400">•</span>
            <span>{request.person_email}</span>
          </div>
        )}

        {/* Hospital Info (for person view) */}
        {request.hospital_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaHospital className="text-gray-400" />
            <span>{request.hospital_name}</span>
            {request.hospital_address && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {request.hospital_address}
                </span>
              </>
            )}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FaCalendar className="text-gray-400" />
          <span>
            Requested on {new Date(request.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AssociationRequestCard;
