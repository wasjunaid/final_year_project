import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES, type UserRole } from "../../constants/roles";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import NavBar from "../../components/NavBar";
import {
  AppointmentRequestStatus,
  type AppointmentRequest,
  type AppointmentRequestStatusType,
} from "../../models/AppointmentRequest";
import type { IDropdownOption } from "../../components/DropDownField";

//TODO: refractor the model to only doctor name and email after changing the api
interface DoctorOfHospital {
  doctor_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  hospital_id: number;
  hospital_name: string;
  address_id: number;
  hospital_address: string;
}

function AppointmentRequestDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useUserRole();

  const request: AppointmentRequest | null = location.state ?? null;
  const [doctors, setDoctors] = useState<DoctorOfHospital[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<IDropdownOption[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states for updating
  const [selectedDoctor, setSelectedDoctor] = useState(
    request?.doctor_id?.toString() || ""
  );
  const [date, setDate] = useState(request?.date || "");
  const [time, setTime] = useState(request?.time || "");
  const [cost, setCost] = useState(request?.cost?.toString() || "");

  const isHospitalStaff = (): boolean => {
    if (
      role === ROLES.HOSPITAL_ADMIN ||
      role === ROLES.HOSPITAL_SUB_ADMIN ||
      role === ROLES.HOSPITAL_FRONT_DESK
    ) {
      return true;
    }

    return false;
  };

  const getActionButtons = (role?: UserRole): ReactNode => {
    switch (role) {
      case ROLES.HOSPITAL_ADMIN:
      case ROLES.HOSPITAL_SUB_ADMIN:
      case ROLES.HOSPITAL_FRONT_DESK:
        return (
          <>
            <Button
              label="Approve"
              onClick={() => handleUpdateStatus("approved")}
              disabled={!cost || !selectedDoctor || !date || !time}
            />
            <Button label="Deny" onClick={() => handleUpdateStatus("denied")} />
          </>
        );
      case ROLES.PATIENT:
        return (
          <>
            <Button
              label="Reschedule"
              onClick={() => handleUpdateStatus("rescheduled")}
            />
            <Button
              label="Cancel"
              onClick={() => handleUpdateStatus("cancelled")}
            />
          </>
        );
      default:
        console.log("Actions Buttons are not defined for this role");
        return null;
    }
  };

  const handleUpdateStatus = async (
    newStatus: AppointmentRequestStatusType
  ) => {
    if (!request) {
      setError("Appointment Request not found!");
      return;
    }

    try {
      if (isHospitalStaff()) {
        // Validation for hospital staff actions
        if (newStatus === AppointmentRequestStatus.approved) {
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
          `${EndPoints.appointments.request.updateHospitalStatus}/${request.appointment_request_id}`,
          {
            status: newStatus,
            doctor_id: parseInt(selectedDoctor) || request.doctor_id,
            date,
            time,
            cost: parseFloat(cost!),
          }
        );
      } else {
        // Patient actions
        if (newStatus === AppointmentRequestStatus.cancelled) {
          await api.put(
            `${EndPoints.appointments.request.cancel}/${request.appointment_request_id}`
          );
        } else if (newStatus === AppointmentRequestStatus.rescheduled) {
          if (!date || !time) {
            setError("Please select new date and time");
            return;
          }
          await api.put(
            `${EndPoints.appointments.request.reschedule}/${request.appointment_request_id}`,
            {
              date,
              time,
              reason: request.reason,
            }
          );
        }
      }
      setSuccess(`Request ${newStatus} successfully!`);
      setTimeout(() => navigate(-1), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update request");
    }
  };

  // TODO: make an api to only get required information (example: name and email) of a hospital
  const getHospitalDoctors = async () => {
    setError("");

    if (!request || !isHospitalStaff() || !request.hospital_id) {
      return;
    }

    try {
      const res = await api.get(
        `${EndPoints.doctor.getForHospital}/${request.hospital_id}`
      );
      setDoctors(res.data.data);
    } catch (error) {
      setError("Failed to fetch doctors");
    }
  };

  // Fetch doctors when component mounts if hospital staff
  useEffect(() => {
    getHospitalDoctors();
  }, []);

  useEffect(() => {
    const mappedDoctors = (doctors ?? []).map((doc) => ({
      label:
        doc.first_name && doc.last_name
          ? `${doc.first_name} ${doc.last_name}`
          : doc.email.toString() ?? "",
      value: doc.doctor_id.toString(),
    }));
    setDoctorOptions(mappedDoctors);
  }, [doctors]);

  const getStatusColor = (status: AppointmentRequestStatusType): string => {
    switch (status) {
      case AppointmentRequestStatus.approved:
        return "text-green-500";
      case AppointmentRequestStatus.processing:
        return "text-yellow-500";
      case AppointmentRequestStatus.cancelled:
      case AppointmentRequestStatus.denied:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (!request)
    return (
      <div className="p-6 text-red-500">Appointment request not found</div>
    );

  return (
    <div className="flex flex-col w-full">
      <NavBar
        className="px-14"
        disableLeadingIcon
        hideNotifications
        onToggleSidebar={() => {}}
        onNotificationsClick={() => {}}
      />

      <div className="flex flex-col px-8 mt-4 gap-3">
        <h1 className="text-xl font-bold">
          Appointment Request # {request.appointment_request_id}
        </h1>

        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}

        {/* Patient Information */}
        <div className="flex justify-between gap-10">
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
        <div className="flex justify-between gap-10">
          {isHospitalStaff() &&
          request.appointment_status === AppointmentRequestStatus.processing ? (
            <LabeledDropDownField
              label="Select Doctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              options={doctorOptions}
              placeholder="Select a doctor"
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

        {/* Hospital Information */}
        {request.hospital_name && (
          <div className="flex justify-between gap-10">
            <LabeledInputField
              title="Hospital"
              value={request.hospital_name}
              disabled
            />
            <LabeledInputField
              title="Address"
              value={request.hospital_address || "N/A"}
              disabled
            />
          </div>
        )}

        {/* Appointment Details */}
        <div className="flex justify-between gap-10">
          {isHospitalStaff() &&
          request.appointment_status === AppointmentRequestStatus.processing ? (
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
          ) : !isHospitalStaff() &&
            request.appointment_status ===
              AppointmentRequestStatus.processing ? (
            <>
              <LabeledInputField
                title="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <LabeledInputField
                title="Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </>
          ) : (
            <>
              <LabeledInputField
                title="Date"
                value={new Date(request.date).toLocaleDateString()}
                disabled
              />
              <LabeledInputField
                title="Time"
                value={request.time.substring(0, 5)}
                disabled
              />
            </>
          )}
        </div>

        <div className="flex justify-between gap-10">
          <LabeledInputField
            title="Status"
            value={request.appointment_status}
            className={getStatusColor(request.appointment_status)}
            disabled
          />
          {isHospitalStaff() && request.appointment_status === "processing" ? (
            <LabeledInputField
              title="Appointment Cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
              placeholder="Enter appointment cost"
            />
          ) : request.cost ? (
            <LabeledInputField
              title="Cost"
              value={`$${request.cost}`}
              disabled
            />
          ) : (
            <div className="w-full" />
          )}
        </div>

        <LabeledInputField
          title="Reason"
          value={request.reason}
          multiline
          rows={4}
          disabled
        />

        {/* Action Buttons */}
        {request.appointment_status === AppointmentRequestStatus.processing && (
          <div className="flex justify-end mt-2 gap-2">
            {getActionButtons(role)}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentRequestDetails;
