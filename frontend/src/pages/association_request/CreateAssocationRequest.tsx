import { useEffect, useState } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import { useHospitalAssociationRequest } from "../../hooks/useHospitalAssociationRequest";
import { useHospitalStaff } from "../../hooks/useHospitalStaff";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";

const roleOptions = [
  { value: "doctor", label: "Doctor" },
  { value: "medical coder", label: "Medical Coder" },
];

function CreateAssociationRequestPage() {
  const role = useUserRole();
  const { 
    loading, 
    error, 
    success, 
    createRequest, 
    clearMessages 
  } = useHospitalAssociationRequest();
  
  const { 
    loading: staffLoading, 
    getStaff 
  } = useHospitalStaff();

  // Form state
  const [selectedRole, setSelectedRole] = useState("doctor");
  const [selectedPersonEmail, setSelectedPersonEmail] = useState("");

  const isHospitalAdmin =
    role === ROLES.HOSPITAL_ADMIN || role === ROLES.HOSPITAL_SUB_ADMIN;

  //TODO find a better way to fetch hospital id
  // Fetch hospital staff data for hospital admin/sub admin
  useEffect(() => {
    const fetchData = async () => {
      if (isHospitalAdmin) {
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
  }, [role, isHospitalAdmin, getStaff]);

  // Check access control
  useEffect(() => {
    if (role && !isHospitalAdmin) {
      // This should be handled by routing but adding as backup
      console.warn("Access Denied: Only Hospital Admin and Hospital Sub Admin can create association requests");
    }
  }, [role, isHospitalAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validation
    if (!selectedPersonEmail) {
      // You might want to show an error here or let the hook handle it
      return;
    }

    try {
      const requestData = {
        email: selectedPersonEmail,
        role: selectedRole,
      };

      await createRequest(requestData);

      // Clear form on success
      setSelectedPersonEmail("");
      setSelectedRole("doctor");
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

  if (loading || staffLoading) {
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
          {/* Hospital info is automatically determined by the backend from the logged-in hospital staff */}
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <p className="text-blue-800 text-sm">
              💡 <strong>Note:</strong> This request will be sent from your hospital. 
              The system automatically identifies your hospital from your login credentials.
            </p>
          </div>

          {/* Select Role */}
          <LabeledDropDownField
            label="Role"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setSelectedPersonEmail(""); // Reset person selection
            }}
            options={roleOptions}
            required
          />

          {/* Select Person (Doctor/Medical Coder) */}
          {selectedRole && (
            <LabeledInputField
              title={
                selectedRole === "doctor"
                  ? "Enter Email address of Doctor"
                  : "Enter Email address of Medical Coder"
              }
              value={selectedPersonEmail}
              onChange={(e) => setSelectedPersonEmail(e.target.value)}
              placeholder={"Enter email address"}
              type="email"
              required
            />
          )}

          <div className="flex gap-4 mt-4">
            <Button
              label={loading ? "Sending..." : "Send Request"}
              type="submit"
              disabled={loading || !selectedPersonEmail}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateAssociationRequestPage;
