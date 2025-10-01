import { useEffect, useState } from "react";
import LabeledInputField from "../../components/LabeledInputField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";

interface Hospital {
  hospital_id: number;
  name: string;
  address: string;
  address_id?: number;
  created_at: string;
  updated_at: string;
}

function HospitalProfile() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchHospital = async () => {
      setLoading(true);
      setError("");
      try {
        // Get staff + hospital details in one call
        const staffRes = await api.get(EndPoints.hospitalStaff.get);
        const hospitalData = staffRes.data.data;

        // Directly set
        setHospital({
          hospital_id: hospitalData.hospital_id,
          name: hospitalData.hospital_name,
          address: hospitalData.hospital_address,
          address_id: hospitalData.address_id, // Add this
          created_at: hospitalData.created_at,
          updated_at: hospitalData.updated_at,
        });

        setName(hospitalData.hospital_name);
        setAddress(hospitalData.hospital_address);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load hospital details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setName(hospital?.name || "");
    setAddress(hospital?.address || "");
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!hospital) return;

    setError("");
    setSuccess("");
    try {
      // First update/create address
    //   const addressRes = await api.post(EndPoints.hospital.address, {
    //     address: address,
    //   });

    //   if (!addressRes.data.success) {
    //     throw new Error(addressRes.data.message);
    //   }

      // Then update hospital with new address
      const res = await api.put(
        `${EndPoints.hospital.update}${hospital.hospital_id}`,
        {
          name,
          address,
        }
      );

      if (res.data.success) {
        setHospital({ ...hospital, name, address });
        setEditMode(false);
        setSuccess("Hospital details updated successfully!");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update hospital details"
      );
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!hospital) {
    return (
      <div className="p-6 text-red-500">
        {error || "No hospital data found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hospital Profile</h2>
        {!editMode ? (
          <Button label="Edit" onClick={handleEdit} />
        ) : (
          <div className="flex gap-2">
            <Button label="Save" onClick={handleSave} />
            <Button label="Cancel" onClick={handleCancel} />
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Hospital Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!editMode}
          required
        />
        <div className="w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={!editMode}
          required
        />
        <div className="w-full"></div>
      </div>

      {/* <div className="mt-4 text-gray-600">
        <p>Created: {new Date(hospital.created_at).toLocaleString()}</p>
        <p>Last Updated: {new Date(hospital.updated_at).toLocaleString()}</p>
      </div> */}
    </div>
  );
}

export default HospitalProfile;
