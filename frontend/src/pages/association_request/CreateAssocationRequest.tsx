import { useEffect, useState } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import {
  HospitalAssociationRequestRole,
  type HospitalAssociationRequestRoleType,
} from "../../models/HospitalAssociationRequest";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import type { IDropdownOption } from "../../components/DropDownField";

const roleOptions = [
  { value: HospitalAssociationRequestRole.doctor, label: "Doctor" },
  {
    value: HospitalAssociationRequestRole.medicalCoder,
    label: "Medical Coder",
  },
];

function CreateAssociationRequestPage() {
  const role = useUserRole();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Form state
  const [selectedRole, setSelectedRole] =
    useState<HospitalAssociationRequestRoleType>(
      HospitalAssociationRequestRole.doctor
    );
  const [selectedPersonEmail, setSelectedPersonEmail] = useState("");

  // Data lists
  const [persons, setPersons] = useState<IDropdownOption[]>([]);

  // Hospital staff state
  const [hospitalId, setHospitalId] = useState("");
  const [hospitalName, setHospitalName] = useState("");

  const isHospitalAdmin =
    role === ROLES.HOSPITAL_ADMIN || role === ROLES.HOSPITAL_SUB_ADMIN;

  // Fetch hospital ID for hospital admin/sub admin
  useEffect(() => {
    const fetchHospitalId = async () => {
      if (isHospitalAdmin) {
        setFetchingData(true);
        try {
          const res = await api.get(EndPoints.hospitalStaff.get);
          const staffData = res.data.data;

          if (staffData.hospital_id) {
            setHospitalId(staffData.hospital_id.toString());
            setHospitalName(staffData.hospital_name || "");
          } else {
            setError("Could not retrieve hospital information");
          }
        } catch (err: any) {
          setError(
            err.response?.data?.message ||
              "Failed to fetch hospital information"
          );
        } finally {
          setFetchingData(false);
        }
      }
    };

    fetchHospitalId();
  }, [isHospitalAdmin]);

  // Fetch doctors or medical coders based on selected role
  useEffect(() => {
    const fetchPersons = async () => {
      if (!isHospitalAdmin || !selectedRole) return;

      setPersons([]);
      setSelectedPersonEmail("");
      setError("");

      try {
        let endpoint = "";

        switch (selectedRole) {
          case HospitalAssociationRequestRole.doctor:
            endpoint = EndPoints.doctor.getAll;
            break;
          case HospitalAssociationRequestRole.medicalCoder:
            // TODO: Add medical coder endpoint when available
            endpoint = "/medical-coder";
            break;
          default:
            endpoint = "";
            break;
        }

        const res = await api.get(endpoint);
        const personOptions = res.data.data.map((p: any) => ({
          value: p.email,
          label:
            p.first_name && p.last_name
              ? `${p.first_name} ${p.last_name} (${p.email})`
              : p.email,
        }));
        setPersons(personOptions);
      } catch (err: any) {
        console.error("Failed to fetch persons:", err);
        setError(
          err.response?.data?.message ||
            `Failed to fetch ${
              selectedRole === HospitalAssociationRequestRole.doctor
                ? "doctors"
                : "medical coders"
            }`
        );
      }
    };

    fetchPersons();
  }, [selectedRole, isHospitalAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!selectedPersonEmail) {
      setError("Please select a person");
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        hospital_id: parseInt(hospitalId),
        email: selectedPersonEmail,
        role: selectedRole,
      };

      await api.post(EndPoints.hospitalAssociationRequest.create, requestData);

      setSuccess("Association request sent successfully!");

      // Clear form
      setSelectedPersonEmail("");
      setSelectedRole(HospitalAssociationRequestRole.doctor);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to send association request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Restrict access to only hospital admin and hospital sub admin
  if (!isHospitalAdmin) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">
          Access Denied: Only Hospital Admin and Hospital Sub Admin can create
          association requests
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {error && <div className="mb-4  text-red-700 rounded-md">{error}</div>}

      {success && (
        <div className="mb-4  text-green-700 rounded-md">{success}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Display hospital info (read-only) */}
          <LabeledInputField
            title="Hospital"
            value={hospitalName || `Hospital ID: ${hospitalId}`}
            disabled
          />

          {/* Select Role */}
          <LabeledDropDownField
            label="Role"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(
                e.target.value as HospitalAssociationRequestRoleType
              );
              setSelectedPersonEmail(""); // Reset person selection
            }}
            options={roleOptions}
            required
          />

          {/* Select Person (Doctor/Medical Coder) */}
          {selectedRole && (
            <LabeledDropDownField
              label={
                selectedRole === HospitalAssociationRequestRole.doctor
                  ? "Select Doctor"
                  : "Select Medical Coder"
              }
              value={selectedPersonEmail}
              onChange={(e) => setSelectedPersonEmail(e.target.value)}
              options={persons}
              placeholder={
                persons.length === 0
                  ? "No available options"
                  : "Select a person"
              }
              required
            />
          )}

          <div className="flex gap-4 mt-4">
            <Button
              label={loading ? "Sending..." : "Send Request"}
              type="submit"
              disabled={loading || !selectedPersonEmail || !hospitalId}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateAssociationRequestPage;
