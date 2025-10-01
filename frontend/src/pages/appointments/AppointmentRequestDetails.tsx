import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import NavBar from "../../components/NavBar";
import { FaArrowLeft } from "react-icons/fa";

interface AppointmentRequest {
  appointment_request_id: number;
  patient_id: number;
  hospital_id: number;
  doctor_id: number;
  date: string;
  time: string;
  reason: string;
  status: string;
  cost?: number;
  // Patient info
  patient_first_name: string | null;
  patient_last_name: string | null;
  patient_email: string;
  // Doctor info
  doctor_first_name: string | null;
  doctor_last_name: string | null;
  doctor_email: string;
  specialization: string | null;
  // Hospital info
  hospital_name?: string;
  hospital_address?: string;
}

// Add this filter function before your component
const filterDoctorsByHospital = (doctors: any[], hospitalId: number) => {
  return doctors.filter((doctor) => doctor.hospital_id === hospitalId);
};

const STATUS_COLORS = {
  processing: "text-yellow-500",
  denied: "text-red-500",
  approved: "text-green-500",
  cancelled: "text-red-500",
} as const;

function AppointmentRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Add navigate
  const role = useUserRole();

  const [request, setRequest] = useState<AppointmentRequest | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states for updating
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cost, setCost] = useState("");

  // Fetch request details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Get the endpoint based on role
        const endpoint =
          role === ROLES.PATIENT
            ? EndPoints.appointments.request.patient
            : EndPoints.appointments.request.hospital;

        // Fetch all requests
        const res = await api.get(endpoint);

        // Find the specific request
        const requestData = res.data.data.find(
          (req: AppointmentRequest) =>
            req.appointment_request_id === parseInt(id || "")
        );

        if (!requestData) {
          throw new Error("Appointment request not found");
        }

        setRequest(requestData);

        // Set initial form values
        setDate(requestData.date);
        setTime(requestData.time);
        setCost(requestData.cost?.toString() || "");
        setSelectedDoctor(requestData.doctor_id?.toString() || "");

        // If hospital staff, fetch available doctors
        if (isHospitalStaff()) {
          const doctorsRes = await api.get(EndPoints.doctor.getAll);

          // Filter doctors by hospital_id
          const filteredDoctors = filterDoctorsByHospital(
            doctorsRes.data.data,
            requestData.hospital_id
          );

          setDoctors(
            filteredDoctors.map((d: any) => ({
              value: d.doctor_id,
              label: `${d.first_name || ""} ${d.last_name || ""} (${d.email}) ${
                d.specialization ? `- ${d.specialization}` : ""
              }`,
            }))
          );
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load request details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, role]);

  const isHospitalStaff = (): boolean => {
    if (!role) return false;

    const hospitalStaffRoles = [
      ROLES.HOSPITAL_ADMIN,
      ROLES.HOSPITAL_SUB_ADMIN,
      ROLES.HOSPITAL_FRONT_DESK,
    ] as const;

    return hospitalStaffRoles.includes(
      role as (typeof hospitalStaffRoles)[number]
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      if (isHospitalStaff()) {
        // Validation for hospital staff actions
        if (newStatus === "approved") {
          if (!cost || parseFloat(cost) <= 0) {
            setError("Please set a valid appointment cost");
            return;
          }
          if (!selectedDoctor) {
            setError("Please select a doctor");
            return;
          }
          if (!date || !time) {
            setError("Please set appointment date and time");
            return;
          }
        }

        await api.put(
          `${EndPoints.appointments.request.updateHospitalStatus}/${id}`,
          {
            status: newStatus,
            doctor_id: selectedDoctor || request?.doctor_id,
            date,
            time,
            cost: parseFloat(cost || "0"),
          }
        );
      } else {
        // Patient actions
        if (newStatus === "cancelled") {
          await api.put(`${EndPoints.appointments.request.cancel}/${id}`);
        } else if (newStatus === "rescheduled") {
          if (!date || !time) {
            setError("Please select new date and time");
            return;
          }
          await api.put(`${EndPoints.appointments.request.reschedule}/${id}`, {
            date,
            time,
            reason: request?.reason,
          });
        }
      }
      setSuccess(`Request ${newStatus} successfully!`);
      setTimeout(() => navigate(-1), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update request");
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "text-gray-500";
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!request) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="w-full">
      <NavBar
        leadingIcon={<FaArrowLeft size={16} />}
        onLeadingIconClick={() => navigate(-1)}
        showNotifications={false}
        onToggleSidebar={function (): void {
          throw new Error("Function not implemented.");
        }}
        onNotificationsClick={function (): void {
          throw new Error("Function not implemented.");
        }}
      />

      <div className="p-8">
        <div className="flex flex-col gap-6 bg-white rounded-lg shadow-md p-6">
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold mb-6">
              Appointment Request Details
            </h2>

            {/* Patient Information */}
            <div className="flex items-center justify-between gap-10">
              <LabeledInputField
                title="Patient Name"
                value={
                  request.patient_first_name && request.patient_last_name
                    ? `${request.patient_first_name} ${request.patient_last_name}`
                    : request.patient_email
                }
                disabled
              />
              <LabeledInputField
                title="Patient Email"
                value={request.patient_email}
                disabled
              />
            </div>

            {/* Doctor Information */}
            <div className="flex items-center justify-between gap-10">
              {isHospitalStaff() && request.status === "processing" ? (
                <LabeledDropDownField
                  label="Select Doctor"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  options={doctors}
                  required
                />
              ) : (
                <LabeledInputField
                  title="Doctor Name"
                  value={
                    request.doctor_first_name && request.doctor_last_name
                      ? `${request.doctor_first_name} ${request.doctor_last_name}`
                      : request.doctor_email
                  }
                  disabled
                />
              )}
              <LabeledInputField
                title="Doctor Email"
                value={request.doctor_email}
                disabled
              />
            </div>

            {/* Appointment Details */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-10">
                {isHospitalStaff() && request?.status === "processing" ? (
                  <>
                    <LabeledInputField
                      title="Date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                    <LabeledInputField
                      title="Time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </>
                ) : (
                  <>
                    <LabeledInputField
                      title="Date"
                      value={new Date(request?.date || "").toLocaleDateString()}
                      disabled
                    />
                    <LabeledInputField
                      title="Time"
                      value={request?.time?.substring(0, 5) || ""}
                      disabled
                    />
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-10">
                <LabeledInputField
                  title="Reason"
                  value={request?.reason || ""}
                  disabled
                />
                <LabeledInputField
                  title="Status"
                  value={request?.status || ""}
                  className={
                    request?.status === "approved"
                      ? "text-green-500"
                      : request?.status === "processing"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }
                  disabled
                />
              </div>
            </div>

            {/* Hospital Staff Actions */}
            {isHospitalStaff() && request?.status === "processing" && (
              <div className="flex flex-col gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">Update Appointment</h3>

                <div className="flex items-center justify-between gap-10">
                  <LabeledInputField
                    title="Appointment Cost"
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    placeholder="Enter appointment cost"
                  />
                  <div className="w-full"></div>
                </div>

                <div className="flex gap-4">
                  <Button
                    label="Approve"
                    onClick={() => handleUpdateStatus("approved")}
                    disabled={!cost || !selectedDoctor || !date || !time}
                  />
                  <Button
                    label="Deny"
                    onClick={() => handleUpdateStatus("denied")}
                  />
                </div>
              </div>
            )}

            {/* Patient Actions */}
            {!isHospitalStaff() && request?.status === "processing" && (
              <div className="flex gap-2">
                <Button
                  label="Cancel"
                  onClick={() => handleUpdateStatus("cancelled")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentRequestDetails;
