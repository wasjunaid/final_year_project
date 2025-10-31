import { useEffect, useState } from "react";
import gradient from "../../assets/images/gradient.png";
import ProfileInfoCard from "../../components/ProfileInfoCard";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import { usePerson } from "../../hooks/usePerson";
import { useDoctor } from "../../hooks/useDoctor";
import type { UpdatePersonRequest } from "../../models/Person";
import type { UpdateDoctorRequest } from "../../models/Doctor";
import profileAvatar from "../../assets/icons/profile.jpg";

function DoctorProfile() {
  const {
    person,
    loading: personLoading,
    error: personError,
    success: personSuccess,
    updatePerson,
    getPerson,
    clearMessages: clearPersonMessages
  } = usePerson();

  const {
    doctor,
    loading: doctorLoading,
    error: doctorError,
    success: doctorSuccess,
    updateDoctor,
    getDoctor,
    clearMessages: clearDoctorMessages
  } = useDoctor();

  const [editMode, setEditMode] = useState(false);
  
  const [personForm, setPersonForm] = useState<UpdatePersonRequest>({
    first_name: "",
    last_name: "",
    cnic: "",
    date_of_birth: "",
    gender: "MALE",
    address: "",
    country_code: "",
    number: "",
  });

  const [doctorForm, setDoctorForm] = useState<UpdateDoctorRequest>({
    license_number: "",
    specialization: "",
    years_of_experience: 0,
    sitting_start: "",
    sitting_end: "",
    hospital_id: undefined,
  });

  const loading = personLoading || doctorLoading;
  const error = personError || doctorError;
  const success = personSuccess || doctorSuccess;

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      await getPerson();
      await getDoctor();
    };
    fetchData();
  }, [getPerson, getDoctor]);

  // Update forms when data is loaded
  useEffect(() => {
    if (person) {
      setPersonForm({
        first_name: person.first_name || "",
        last_name: person.last_name || "",
        cnic: person.cnic || "",
        date_of_birth: person.date_of_birth || "",
        gender: person.gender || "MALE",
        address: person.address || "",
        country_code: person.country_code || "",
        number: person.number || "",
      });
    }
  }, [person]);

  useEffect(() => {
    if (doctor) {
      setDoctorForm({
        license_number: doctor.license_number || "",
        specialization: doctor.specialization || "",
        years_of_experience: doctor.years_of_experience || 0,
        sitting_start: doctor.sitting_start || "",
        sitting_end: doctor.sitting_end || "",
        hospital_id: doctor.hospital_id,
      });
    }
  }, [doctor]);

  const handleEdit = () => {
    setEditMode(true);
    clearPersonMessages();
    clearDoctorMessages();
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset forms to original data
    if (person) {
      setPersonForm({
        first_name: person.first_name || "",
        last_name: person.last_name || "",
        cnic: person.cnic || "",
        date_of_birth: person.date_of_birth || "",
        gender: person.gender || "MALE",
        address: person.address || "",
        country_code: person.country_code || "",
        number: person.number || "",
      });
    }
    if (doctor) {
      setDoctorForm({
        license_number: doctor.license_number || "",
        specialization: doctor.specialization || "",
        years_of_experience: doctor.years_of_experience || 0,
        sitting_start: doctor.sitting_start || "",
        sitting_end: doctor.sitting_end || "",
        hospital_id: doctor.hospital_id,
      });
    }
    clearPersonMessages();
    clearDoctorMessages();
  };

  const handlePersonChange = (field: keyof UpdatePersonRequest, value: string) => {
    setPersonForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDoctorChange = (field: keyof UpdateDoctorRequest, value: string | number) => {
    setDoctorForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    clearPersonMessages();
    clearDoctorMessages();
    
    try {
      // Update both person and doctor information
      const [personSuccess, doctorSuccess] = await Promise.all([
        updatePerson(personForm),
        updateDoctor(doctorForm)
      ]);

      if (personSuccess && doctorSuccess) {
        setEditMode(false);
        // Refresh data
        await getPerson();
        await getDoctor();
      }
    } catch (err: any) {
      console.error("Failed to update profile:", err);
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
          fullName={`${person.first_name || ''} ${person.last_name || ''}`}
          email={person.email}
          imageElement={<img className="h-20" src={profileAvatar} alt="Profile" />}
        />
        {!editMode ? (
          <Button label="Edit" onClick={handleEdit} />
        ) : (
          <div className="flex gap-2">
            <Button label="Save" onClick={handleSave} disabled={loading} />
            <Button label="Cancel" onClick={handleCancel} />
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      {/* Hospital Information Section */}
      {doctor.hospital_name && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Hospital Information</h3>
          <div className="text-gray-600">
            <p>Hospital: {doctor.hospital_name}</p>
            <p>Status: {doctor.doctor_status}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 px-4 mt-4">
        {/* Person Information */}
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="First Name"
            value={personForm.first_name || ""}
            onChange={(e) => handlePersonChange("first_name", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Last Name"
            value={personForm.last_name || ""}
            onChange={(e) => handlePersonChange("last_name", e.target.value)}
            disabled={!editMode}
          />
        </div>
        
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="CNIC"
            value={personForm.cnic || ""}
            onChange={(e) => handlePersonChange("cnic", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Date of Birth"
            type="date"
            value={personForm.date_of_birth || ""}
            onChange={(e) => handlePersonChange("date_of_birth", e.target.value)}
            disabled={!editMode}
          />
        </div>

        <div className="flex items-center justify-between gap-10">
          <LabeledDropDownField
            label="Gender"
            options={[
              { label: "Male", value: "MALE" },
              { label: "Female", value: "FEMALE" },
              { label: "Other", value: "OTHER" },
            ]}
            placeholder="Select your gender"
            value={personForm.gender || ""}
            onChange={(e) => handlePersonChange("gender", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Address"
            value={personForm.address || ""}
            onChange={(e) => handlePersonChange("address", e.target.value)}
            disabled={!editMode}
          />
        </div>

        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Country Code"
            value={personForm.country_code || ""}
            onChange={(e) => handlePersonChange("country_code", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Phone Number"
            value={personForm.number || ""}
            onChange={(e) => handlePersonChange("number", e.target.value)}
            disabled={!editMode}
          />
        </div>

        {/* Doctor Information */}
        <h3 className="text-lg font-semibold mt-6">Professional Information</h3>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="License Number"
            value={doctorForm.license_number || ""}
            onChange={(e) => handleDoctorChange("license_number", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Specialization"
            value={doctorForm.specialization || ""}
            onChange={(e) => handleDoctorChange("specialization", e.target.value)}
            disabled={!editMode}
          />
        </div>

        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Years of Experience"
            type="number"
            value={doctorForm.years_of_experience?.toString() || "0"}
            onChange={(e) => handleDoctorChange("years_of_experience", parseInt(e.target.value) || 0)}
            disabled={!editMode}
          />
          <div className="w-1/2"></div> {/* Empty space for alignment */}
        </div>

        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Sitting Start Time"
            type="time"
            value={doctorForm.sitting_start || ""}
            onChange={(e) => handleDoctorChange("sitting_start", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Sitting End Time"
            type="time"
            value={doctorForm.sitting_end || ""}
            onChange={(e) => handleDoctorChange("sitting_end", e.target.value)}
            disabled={!editMode}
          />
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;