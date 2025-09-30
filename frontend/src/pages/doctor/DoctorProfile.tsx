import { useEffect, useState } from "react";
import gradient from "../../assets/images/gradient.png";
import ProfileInfoCard from "../../components/ProfileInfoCard";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import type { Person } from "../../models/Person";
import type { Doctor } from "../../models/Doctor";
import profileAvatar from "../../assets/icons/profile.jpg";

function DoctorProfile() {
  const [person, setPerson] = useState<Person | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [personForm, setPersonForm] = useState<Person>({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [doctorForm, setDoctorForm] = useState<Doctor>({
    doctor_id: 0,
    license_number: "",
    specialization: "",
    years_of_experience: 0,
    sitting_start: "",
    sitting_end: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch person and doctor data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [personRes, doctorRes] = await Promise.all([
          api.get(EndPoints.person.get),
          api.get(EndPoints.doctor.profile),
        ]);
        setPerson(personRes.data.data);
        setPersonForm(personRes.data.data);
        setDoctor(doctorRes.data.data);
        setDoctorForm(doctorRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
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
    setPersonForm(person!);
    setDoctorForm(doctor!);
    setSuccess("");
    setError("");
  };

  const handlePersonChange = (field: keyof Person, value: string) => {
    setPersonForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDoctorChange = (field: keyof Doctor, value: string | number) => {
    setDoctorForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      // Update person info
      await api.put(EndPoints.person.update, personForm);
      // Update doctor info
      await api.put(EndPoints.doctor.profile, doctorForm);
      setPerson(personForm);
      setDoctor(doctorForm);
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

  if (!person || !doctor) {
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
        {/* Person fields */}
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="First Name"
            value={personForm.first_name}
            onChange={(e) => handlePersonChange("first_name", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Last Name"
            value={personForm.last_name}
            onChange={(e) => handlePersonChange("last_name", e.target.value)}
            disabled={!editMode}
          />
        </div>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Email"
            value={personForm.email}
            onChange={(e) => handlePersonChange("email", e.target.value)}
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
            value={personForm.gender || ""}
            onChange={(e) => handlePersonChange("gender", e.target.value)}
            disabled={!editMode}
          />
        </div>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Date of Birth"
            value={personForm.date_of_birth || ""}
            onChange={(e) =>
              handlePersonChange("date_of_birth", e.target.value)
            }
            disabled={!editMode}
          />
          <LabeledInputField
            title="Blood Group"
            value={personForm.blood_group || ""}
            onChange={(e) => handlePersonChange("blood_group", e.target.value)}
            disabled={!editMode}
          />
        </div>
        {/* Doctor-specific fields */}
        <div className="flex items-center justify-between gap-10 mt-6">
          <LabeledInputField
            title="License Number"
            value={doctorForm.license_number?.toString() || ""}
            onChange={(e) =>
              handleDoctorChange("license_number", e.target.value)
            }
            disabled={!editMode}
          />
          <LabeledInputField
            title="Specialization"
            value={doctorForm.specialization || ""}
            onChange={(e) =>
              handleDoctorChange("specialization", e.target.value)
            }
            disabled={!editMode}
          />
        </div>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Years of Experience"
            value={doctorForm.years_of_experience?.toString() || ""}
            onChange={(e) =>
              handleDoctorChange("years_of_experience", Number(e.target.value))
            }
            type="number"
            disabled={!editMode}
          />
          <LabeledInputField
            title="Sitting Start"
            value={doctorForm.sitting_start || ""}
            onChange={(e) =>
              handleDoctorChange("sitting_start", e.target.value)
            }
            type="time"
            disabled={!editMode}
          />
          <LabeledInputField
            title="Sitting End"
            value={doctorForm.sitting_end || ""}
            onChange={(e) => handleDoctorChange("sitting_end", e.target.value)}
            type="time"
            disabled={!editMode}
          />
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
