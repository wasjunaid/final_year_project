import { useEffect, useState } from "react";
import { FaUser, FaCalendar, FaFileAlt } from "react-icons/fa";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import type { EHRData } from "../../models/EHRData";

interface EHRPageProps {
  patientId: number; // Required - doctor must specify which patient's EHR to view
}

function EHRPage({ patientId }: EHRPageProps) {
  const role = useUserRole();
  const [ehrData, setEhrData] = useState<EHRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isDoctor = role === ROLES.DOCTOR;

  useEffect(() => {
    fetchEHRData();
  }, [patientId]);

  const fetchEHRData = async () => {
    setLoading(true);
    setError("");

    try {
      if (!isDoctor) {
        setError("Access denied. Only doctors can use this EHR viewer.");
        return;
      }

      if (!patientId) {
        setError("Patient ID is required to view EHR data.");
        return;
      }

      // Doctor viewing specific patient's EHR
      console.log("Fetching EHR for doctor - Patient ID:", patientId);

      // Using GET request with query parameters based on backend implementation
      const response = await api.post(EndPoints.ehr.doctor, {
        patient_id: patientId,
      });

      console.log("Doctor EHR response:", response);

      // Check if response has proper data structure
      if (response.data && response.data.data) {
        setEhrData(response.data.data);
      } else {
        setError("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("EHR fetch error:", err);

      // Better error handling for doctors
      if (err.response?.status === 403) {
        setError(
          "Access denied. You don't have permission to view this patient's EHR."
        );
      } else if (err.response?.status === 404) {
        setError("Patient EHR not found or access not granted.");
      } else if (err.response?.status === 400) {
        setError("Invalid patient ID or missing access permissions.");
      } else {
        setError(
          err.response?.data?.message || "Failed to load patient EHR data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Role-based access control
  if (!isDoctor) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only doctors can view patient EHR data through this interface.</p>
          <p className="text-sm mt-2 text-gray-600">
            Patients should use their own portal to view their medical records.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading patient EHR data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Error</p>
          <p>{error}</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>Make sure you have been granted access to this patient's EHR.</p>
            <p>
              You may need to request access first through the EHR Access
              Requests page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!ehrData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No EHR data found</p>
          <p>No medical records available for this patient</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* EHR Access Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded-full">
            <FaUser className="text-blue-600 text-sm" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">EHR Access Information</p>
            <p>
              You are viewing this patient's EHR because they have granted you
              access. This access can be revoked by the patient at any time.
              Please handle this medical information with care and in accordance
              with HIPAA guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <FaUser className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Patient Information
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Personal Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {ehrData.personData.first_name}{" "}
                    {ehrData.personData.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">
                    {ehrData.personData.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">
                    {ehrData.personData.phone_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="font-medium">
                    {new Date(
                      ehrData.personData.date_of_birth
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium capitalize">
                    {ehrData.personData.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">
                    {ehrData.personData.address || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Medical Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="font-medium">
                    {ehrData.patientData.patient_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="font-medium">
                    {ehrData.patientData.blood_group || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="font-medium">
                    {ehrData.patientData.emergency_contact_name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Phone:</span>
                  <span className="font-medium">
                    {ehrData.patientData.emergency_contact_phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History & Allergies */}
          <div className="mt-6 space-y-4">
            {ehrData.patientData.medical_history && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Medical History
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                  {ehrData.patientData.medical_history}
                </p>
              </div>
            )}

            {ehrData.patientData.allergies && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">⚠️ Allergies</h3>
                <p className="text-red-700 bg-red-50 p-3 rounded-md border border-red-200">
                  {ehrData.patientData.allergies}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointments */}
      {ehrData.appointments && ehrData.appointments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <FaCalendar className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Appointments History
              </h2>
            </div>

            <div className="space-y-4">
              {ehrData.appointments.map((appointment) => (
                <div
                  key={appointment.appointment_id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {appointment.doctor_name} - {appointment.hospital_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString()}{" "}
                        at {appointment.appointment_time}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {appointment.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Clinical Notes:</span>{" "}
                        {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Medical Documents */}
      {ehrData.unverifiedDocuments &&
        ehrData.unverifiedDocuments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FaFileAlt className="text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Medical Documents
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ehrData.unverifiedDocuments.map((document) => (
                  <div
                    key={document.document_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaFileAlt className="text-gray-400" />
                      <h3
                        className="font-medium text-gray-900 truncate"
                        title={document.original_name}
                      >
                        {document.original_name}
                      </h3>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Type:</span>{" "}
                        {document.document_type}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Uploaded:</span>{" "}
                        {new Date(document.created_at).toLocaleDateString()}
                      </p>
                      {document.detail && (
                        <p className="text-gray-700 mt-2 text-xs bg-gray-50 p-2 rounded">
                          {document.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default EHRPage;
