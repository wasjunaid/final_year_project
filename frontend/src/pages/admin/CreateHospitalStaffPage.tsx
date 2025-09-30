import { useState, useEffect } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuth();

  // filter staff roles based on user role
  const STAFF_ROLES =
    user?.role === ROLES.SUPER_ADMIN
      ? ALL_STAFF_ROLES
      : ALL_STAFF_ROLES.filter((r) => r.value !== "hospital admin");

  // Fetch hospitals list on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get(EndPoints.hospital.get);
        const hospitalOptions = res.data.data.map((h: any) => ({
          label: h.name,
          value: h.hospital_id,
        }));
        setHospitals(hospitalOptions);
      } catch {
        setError("Failed to load hospitals");
      }
    };
    fetchHospitals();
  }, []);

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    if (!email || !hospitalId || !role) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(EndPoints.hospitalStaff.insert, {
        email,
        hospital_id: hospitalId,
        role,
      });

      if (res.data.success) {
        setSuccess("Hospital staff created successfully!");
        setEmail("");
        setHospitalId("");
        setRole("");
      } else {
        setError(res.data.message || "Failed to create hospital staff.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create hospital staff.");
    } finally {
      setLoading(false);
    }
  };

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
