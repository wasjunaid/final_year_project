import { FaHospital, FaUserMd, FaCheck, FaTimes, FaClock } from "react-icons/fa";
// import { HospitalAssociationRequest } from "../../../models/HospitalAssociationRequest";
// import Doctor  from "../../../models/Doctor";
import Button from "../../../components/Button";

interface AssociationRequestCardProps {
  request: any; //HospitalAssociationRequest;
  doctors?: any[];
  showActions: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function AssociationRequestCard({
  request,
  doctors,
  showActions,
  onApprove,
  onReject,
}: AssociationRequestCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get doctor name from doctors list
  const getDoctorName = () => {
    if (!doctors || doctors.length === 0) {
      return "Unknown Doctor";
    }

    const doctor = doctors.find((d) => d.person_id === request.person_id);
    if (doctor) {
      return `Dr. ${doctor.first_name} ${doctor.last_name}`;
    }

    return "Unknown Doctor";
  };

  // Get hospital name
  const getHospitalName = () => {
    return request.hospital_name || "Unknown Hospital";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaHospital className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {getHospitalName()}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaUserMd className="text-gray-400" />
              {getDoctorName()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaClock />
          Pending
        </span>
      </div>

      {/* Request Details */}
      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Request ID:</span>{" "}
          {request.hospital_association_request_id}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Requested on:</span>{" "}
          {formatDate(request.created_at)}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <Button
            label="Approve"
            icon={<FaCheck />}
            onClick={() =>
              onApprove(request.hospital_association_request_id)
            }
            className="flex-1"
          />
          <Button
            label="Reject"
            icon={<FaTimes />}
            variant="secondary"
            onClick={() =>
              onReject(request.hospital_association_request_id)
            }
            className="flex-1"
          />
        </div>
      )}

      {/* Hospital Staff View - No Actions */}
      {!showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Waiting for doctor's response
          </p>
        </div>
      )}
    </div>
  );
}

export default AssociationRequestCard;
