import { useEffect, useState } from "react";
import gradient from "../../assets/images/gradient.png";
import ProfileInfoCard from "../../components/ProfileInfoCard";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import type { Person } from "../../models/Person";
import type { Patient } from "../../models/Patient";
import profileAvatar from "../../assets/icons/profile.jpg";

function PatientDemographicsPage() {
  const [person, setPerson] = useState<Person | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Person>({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch person and patient data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [personRes, patientRes] = await Promise.all([
          api.get(EndPoints.person.get),
          api.get("/patient"), // or EndPoints.patient.profile if defined
        ]);
        setPerson(personRes.data.data);
        setForm(personRes.data.data);
        setPatient(patientRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load demographics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(person!);
    setSuccess("");
    setError("");
  };

  const handleChange = (field: keyof Person, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await api.put(EndPoints.person.update, form);
      setPerson(res.data.data);
      setEditMode(false);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        Loading...
      </div>
    );
  }

  if (!person) {
    return <div className="p-8 text-red-500">{error || "No data found."}</div>;
  }

  return (
    <div className="py-5 px-10 w-full">
      <img src={gradient} className="w-full" alt="gradient" />

      <div className="flex items-center justify-between">
        <ProfileInfoCard
          fullName={`${person.first_name} ${person.last_name}`}
          email={person.email}
          imageElement={<img className="h-20" src={profileAvatar} />}
        />
        {!editMode ? (
          <Button label="Edit" onClick={handleEdit} />
        ) : (
          <div className="flex gap-2">
            <Button label="Save" onClick={handleSave} />
            <Button label="Cancel" onClick={handleCancel} />
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      <div className="flex flex-col gap-5 px-4 mt-4">
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="First Name"
            value={form.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Last Name"
            value={form.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            disabled={!editMode}
          />
        </div>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={!editMode}
          />
          <LabeledDropDownField
            label="Gender"
            options={[
              { label: "Male", value: "m" },
              { label: "Female", value: "f" },
              { label: "Other", value: "o" },
            ]}
            placeholder="Select your gender"
            value={form.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
            disabled={!editMode}
          />
        </div>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Date of Birth"
            value={form.date_of_birth || ""}
            onChange={(e) => handleChange("date_of_birth", e.target.value)}
            disabled={!editMode}
            type="date"
          />
          <LabeledInputField
            title="Blood Group"
            value={form.blood_group || ""}
            onChange={(e) => handleChange("blood_group", e.target.value)}
            disabled={!editMode}
          />
        </div>
        {/* Patient-specific fields */}
        {patient && (
          <div className="flex items-center justify-between gap-10">
            <div className="w-1/2 pr-5">
              <LabeledInputField
                title="Patient ID"
                value={patient.patient_id.toString()}
                disabled
              />
            </div>
            {/* Add more patient-specific fields here if needed */}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDemographicsPage;
