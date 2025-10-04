import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import AuthButton from "./AuthButton";
import type { UserRole } from "../../../constants/roles";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import LabeledDropDownField from "../../../components/LabeledDropDownField";

interface GoogleAuthButtonProps {
  className?: string;
}

const roleOptions = [
  { label: "Patient", value: "patient" },
  { label: "Doctor", value: "doctor" },
  //   { label: "super admin", value: "super admin" },
  //   { label: "admin", value: "admin" },
  { label: "hospital admin", value: "hospital admin" },
  { label: "hospital sub admin", value: "hospital sub admin" },
  { label: "hospital front desk", value: "hospital front desk" },
  {
    label: "hospital lab technician",
    value: "hospital lab technician",
  },
];

function GoogleAuthButton({ className }: GoogleAuthButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>();
  const [error, setError] = useState("");

  const handleGoogleAuth = () => {
    if (!selectedRole) {
      setError("Please select a role to continue");
      return;
    }

    // Encode the role in base64 for the state parameter
    const roleObject = { role: selectedRole };
    const jsonString = JSON.stringify(roleObject);
    const encodedState = btoa(jsonString);

    // Redirect to backend Google auth endpoint with role state
    const backendUrl = import.meta.env.REACT_API_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/auth/google?state=${encodedState}`;
  };

  const handleRoleSelect = (role: UserRole) => {
    setError("");
    setSelectedRole(role);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRole(undefined);
    setError("");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
  };

  return (
    <>
      <AuthButton
        className={className}
        label="Continue with Google"
        icon={<FaGoogle />}
        onClick={() => setShowModal(true)}
      />

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/80"
          onClick={handleBackdropClick}
        >
          <Card className="max-w-md w-full p-6">
            {error && <p className="text-center text-red-500 mb-2">{error}</p>}

            <h2 className="text-xl text-center font-semibold mb-4">
              Select Role To Continue
            </h2>

            <LabeledDropDownField
              label="Role"
              options={roleOptions}
              className="mb-6"
              placeholder="Select your role"
              required
              value={selectedRole || ""}
              onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
            />

            <div className="flex justify-end space-x-3">
              <Button label="Cancel" onClick={handleModalClose} />
              <Button label="Continue" onClick={handleGoogleAuth} />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default GoogleAuthButton;
