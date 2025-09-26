import { useState } from "react";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import LabeledInputField from "../../components/LabeledInputField";
import Button from "../../components/Button";

function CreateAppointmentPage() {
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState("");

  // Dummy dropdown options
  const hospitalOptions = [
    { label: "City Hospital", value: "city" },
    { label: "Green Valley Clinic", value: "valley" },
    { label: "Community Health", value: "community" },
  ];

  const doctorOptions = [
    { label: "Dr. Smith", value: "smith" },
    { label: "Dr. Adams", value: "adams" },
    { label: "Dr. Lee", value: "lee" },
  ];

  const dateOptions = [
    { label: "6 Sep, 2025", value: "2025-09-06" },
    { label: "7 Sep, 2025", value: "2025-09-07" },
    { label: "8 Sep, 2025", value: "2025-09-08" },
  ];

  const timeOptions = [
    { label: "10:00 AM", value: "10:00" },
    { label: "02:00 PM", value: "14:00" },
    { label: "06:00 PM", value: "18:00" },
  ];

  return (
    <div className="p-6 space-y-6 ">
      {/* Hospital */}
      <LabeledDropDownField
        label="Select Hospital"
        placeholder="Select the hospital"
        options={hospitalOptions}
        value={hospital}
        onChange={(e) => setHospital(e.target.value)}
      />

      {/* Doctor */}
      <LabeledDropDownField
        label="Select Doctor"
        placeholder="Select the doctor"
        options={doctorOptions}
        value={doctor}
        onChange={(e) => setDoctor(e.target.value)}
        hint="Leave this field empty if you do not have a preferred doctor"
      />

      {/* Date + Time in a row */}
      <div className="flex gap-4">
        <LabeledDropDownField
          className="flex-1"
          label="Select Date"
          options={dateOptions}
          placeholder="Select date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <LabeledDropDownField
          className="flex-1"
          label="Select Time"
          options={timeOptions}
          placeholder="Select time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      {/* Symptoms (textarea) */}
      <LabeledInputField
        title="Symptoms"
        placeholder="Explain the symptoms so we can assign the most suitable doctor"
        multiline
        rows={4}
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      {/* Button */}
      <div>
        <Button
          label="Create Appointment"
          onClick={() =>
            alert(
              `Appointment Created:\nHospital: ${hospital}\nDoctor: ${doctor}\nDate: ${date}\nTime: ${time}\nSymptoms: ${symptoms}`
            )
          }
        />
      </div>
    </div>
  );
}

export default CreateAppointmentPage;
