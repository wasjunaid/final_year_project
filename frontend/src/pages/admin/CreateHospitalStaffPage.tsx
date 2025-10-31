import { useState, useEffect } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import { useHospitalStaff } from "../../hooks/useHospitalStaff";
import { useHospital } from "../../hooks/useHospital";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";

const ALL_STAFF_ROLES = [
  { label: "Hospital Admin", value: "hospital admin" },
  { label: "Hospital Sub Admin", value: "hospital sub admin" },
  { label: "Hospital Front Desk", value: "hospital front desk" },
  { label: "Hospital Lab Technician", value: "hospital lab technician" },
];

function CreateHospitalStaffPage() {
  const [email, setEmail] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [role, setRole] = useState("");
  const [hospitals, setHospitals] = useState<Array<{ label: string; value: number }>>([]);

  const { role: userRole } = useAuth();
  const { 
    loading, 
    success, 
    error, 
    createStaff, 
    clearMessages 
  } = useHospitalStaff();
  
  const { 
    hospitals: hospitalList, 
    getHospitals 
  } = useHospital();

  // filter staff roles based on user role
  const STAFF_ROLES =
    userRole === ROLES.SUPER_ADMIN
      ? ALL_STAFF_ROLES
      : ALL_STAFF_ROLES.filter((r) => r.value !== "hospital admin");

  // Fetch hospitals list on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        await getHospitals();
      } catch {
        // Error handled by hook
      }
    };
    fetchHospitals();
  }, []);

  // Update hospitals options when hospital data changes
  useEffect(() => {
    if (hospitalList.length > 0) {
      const hospitalOptions = hospitalList.map((h: any) => ({
        label: h.name,
        value: h.hospital_id,
      }));
      setHospitals(hospitalOptions);
    }
  }, [hospitalList]);

  const handleCreate = async () => {
    clearMessages();
    if (!email || !hospitalId || !role) {
      // Let the hook handle validation
      return;
    }

    try {
      await createStaff({
        email,
        hospital_id: parseInt(hospitalId),
        role,
      });

      // Clear form on success
      setEmail("");
      setHospitalId("");
      setRole("");
    } catch (err) {
      // Error handled by hook
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

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold mb-6">Create Hospital Staff</h2>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledDropDownField
          label="Hospital"
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
          options={hospitals}
          required
        />
        <div className="w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledDropDownField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={STAFF_ROLES}
          required
        />
        <div className="w-full"></div>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      <div>
        <Button
          className="max-w-xs mt-4"
          label={loading ? "Creating..." : "Create Staff"}
          onClick={handleCreate}
          disabled={loading}
        />
      </div>
    </div>
  );
}

export default CreateHospitalStaffPage;
