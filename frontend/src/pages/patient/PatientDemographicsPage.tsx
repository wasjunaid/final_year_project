import { useEffect, useState, useCallback, useMemo } from "react";
import gradient from "../../assets/images/gradient.png";
import ProfileInfoCard from "../../components/ProfileInfoCard";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import { usePerson } from "../../hooks/usePerson";
import { usePatient } from "../../hooks/usePatient";
import profileAvatar from "../../assets/icons/profile.jpg";
import type { UpdatePersonRequest } from "../../models/Person";
import type { UpdatePatientRequest } from "../../models/Patient";

interface FormData extends UpdatePersonRequest, UpdatePatientRequest {}

function PatientDemographicsPage() {
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
    loading: patientLoading, 
    error: patientError,
    success: patientSuccess,
    patient,
    getPatient,
    updatePatient,
    clearMessages: clearPatientMessages
  } = usePatient();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormData>({
    first_name: "",
    last_name: "",
    cnic: "",
    date_of_birth: "",
    gender: "M",
    address: "",
    country_code: "",
    number: "",
    emergency_contact_country_code: "",
    emergency_contact_number: "",
    blood_group: undefined,
  });

  // Memoize loading, error, and success states
  const loading = useMemo(() => personLoading || patientLoading, [personLoading, patientLoading]);
  const error = useMemo(() => personError || patientError, [personError, patientError]);
  const success = useMemo(() => personSuccess || patientSuccess, [personSuccess, patientSuccess]);

  // Memoize data fetching function
  const fetchData = useCallback(async () => {
    await Promise.all([getPerson(), getPatient()]);
  }, [getPerson, getPatient]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update form when person or patient data changes
  useEffect(() => {
    if (person || patient) {
      setForm({
        first_name: person?.first_name || "",
        last_name: person?.last_name || "",
        cnic: person?.cnic || "",
        date_of_birth: person?.date_of_birth || "",
        gender: person?.gender || "M",
        address: person?.address || "",
        country_code: person?.country_code || "",
        number: person?.number || "",
        emergency_contact_country_code: patient?.emergency_contact_country_code || "",
        emergency_contact_number: patient?.emergency_contact_number || "",
        blood_group: patient?.blood_group || undefined,
      });
    }
  }, [person, patient]);

  // Memoize handlers
  const handleEdit = useCallback(() => {
    setEditMode(true);
    clearPersonMessages();
    clearPatientMessages();
  }, [clearPersonMessages, clearPatientMessages]);

  const handleCancel = useCallback(() => {
    setEditMode(false);
    if (person || patient) {
      setForm({
        first_name: person?.first_name || "",
        last_name: person?.last_name || "",
        cnic: person?.cnic || "",
        date_of_birth: person?.date_of_birth || "",
        gender: person?.gender || "M",
        address: person?.address || "",
        country_code: person?.country_code || "",
        number: person?.number || "",
        emergency_contact_country_code: patient?.emergency_contact_country_code || "",
        emergency_contact_number: patient?.emergency_contact_number || "",
        blood_group: patient?.blood_group || undefined,
      });
    }
    clearPersonMessages();
    clearPatientMessages();
  }, [person, patient, clearPersonMessages, clearPatientMessages]);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setForm((prev: FormData) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    clearPersonMessages();
    clearPatientMessages();
    
    // Separate person and patient data
    const personData: UpdatePersonRequest = {
      first_name: form.first_name,
      last_name: form.last_name,
      cnic: form.cnic,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      address: form.address,
      country_code: form.country_code,
      number: form.number,
    };

    const patientData: UpdatePatientRequest = {
      emergency_contact_country_code: form.emergency_contact_country_code,
      emergency_contact_number: form.emergency_contact_number,
      blood_group: form.blood_group,
    };

    // Update both person and patient data
    const [personSuccess, patientUpdateSuccess] = await Promise.all([
      updatePerson(personData),
      updatePatient(patientData)
    ]);
    
    if (personSuccess && patientUpdateSuccess) {
      setEditMode(false);
      // Refresh data
      await fetchData();
    }
  }, [form, clearPersonMessages, clearPatientMessages, updatePerson, updatePatient, fetchData]);

  // Memoize dropdown options
  const genderOptions = useMemo(() => [
    { label: "Male", value: "M" },
    { label: "Female", value: "F" },
    { label: "Other", value: "O" },
  ], []);

  const bloodGroupOptions = useMemo(() => [
    { label: "Select Blood Group", value: "" },
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ], []);

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
          fullName={`${person.first_name || ''} ${person.last_name || ''}`}
          email={person.email}
          imageElement={<img className="h-20" src={profileAvatar} alt="Profile" />}
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
            value={form.first_name || ""}
            onChange={(e) => handleChange("first_name", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Last Name"
            value={form.last_name || ""}
            onChange={(e) => handleChange("last_name", e.target.value)}
            disabled={!editMode}
          />
        </div>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="CNIC"
            value={form.cnic || ""}
            onChange={(e) => handleChange("cnic", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Date of Birth"
            type="date"
            value={form.date_of_birth || ""}
            onChange={(e) => handleChange("date_of_birth", e.target.value)}
            disabled={!editMode}
          />
        </div>
        <div className="flex items-center justify-between gap-10">
          <LabeledDropDownField
            label="Gender"
            options={genderOptions}
            placeholder="Select your gender"
            value={form.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Address"
            value={form.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            disabled={!editMode}
          />
        </div>
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Country Code"
            value={form.country_code || ""}
            onChange={(e) => handleChange("country_code", e.target.value)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Phone Number"
            value={form.number || ""}
            onChange={(e) => handleChange("number", e.target.value)}
            disabled={!editMode}
          />
        </div>
        
        {/* Patient-specific fields */}
        <div className="flex items-center justify-between gap-10">
          <LabeledDropDownField
            label="Blood Group"
            options={bloodGroupOptions}
            placeholder="Select your blood group"
            value={form.blood_group || ""}
            onChange={(e) => handleChange("blood_group", e.target.value as any)}
            disabled={!editMode}
          />
          <LabeledInputField
            title="Emergency Contact Country Code"
            value={form.emergency_contact_country_code || ""}
            onChange={(e) => handleChange("emergency_contact_country_code", e.target.value)}
            disabled={!editMode}
          />
        </div>
        
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="Emergency Contact Number"
            value={form.emergency_contact_number || ""}
            onChange={(e) => handleChange("emergency_contact_number", e.target.value)}
            disabled={!editMode}
          />
          <div className="w-full"></div> {/* Empty div for grid alignment */}
        </div>
      </div>
    </div>
  );
}

export default PatientDemographicsPage;