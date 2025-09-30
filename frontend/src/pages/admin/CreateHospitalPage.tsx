import { useState } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";

export function CreateHospitalPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    if (!name || !address) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(EndPoints.hospital.create, { name, address });
      if (res.data.success) {
        setSuccess("Hospital created successfully!");
        setName("");
        setAddress("");
      } else {
        setError(res.data.message || "Failed to create hospital.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create hospital.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold mb-6">Create Hospital</h2>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Hospital Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <div className="w-full"></div>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      <div>
        <Button
        className="max-w-xs mt-4"
        label={loading ? "Creating..." : "Create Hospital"}
        onClick={handleCreate}
        disabled={loading}
      />
      </div>
    </div>
  );
}
