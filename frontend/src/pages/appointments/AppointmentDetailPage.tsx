import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { type Appointment } from "../../models/Appointment";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownFieldWithButton from "../../components/LabeledDorpDownFieldWithButton";
import Button from "../../components/Button";

function AppointmentDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const appointment: Appointment | null = location.state ?? null;

  const [error, setError] = useState("");

  // if (!appointment) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col w-full p-10 gap-3">
      {/* <NavBar
        className="px-14"
        disableLeadingIcon
        hideNotifications
        onToggleSidebar={() => {}}
        onNotificationsClick={() => {}}
      /> */}

      <h1 className="text-xl font-bold">Apointment Title</h1>

      <div className="flex justify-between gap-10">
        <LabeledInputField title="Hospital" />
        <LabeledInputField title="Doctor" />
      </div>

      <div className="flex justify-between gap-10">
        <LabeledInputField title="Date" type="date" />
        <LabeledInputField title="Time" type="time" />
      </div>

      <div className="flex justify-between items-center gap-10">
        <LabeledInputField title="Status" />
        <div className="w-full" />
      </div>

      <div className="flex justify-between gap-10">
        <LabeledDropDownFieldWithButton
          className="mr-3"
          options={[]}
          label="EHR Request"
          buttonLabel="EHR Request"
          onButtonClick={() => {}}
          disabled
        />
        <div className="w-full" />
      </div>

      <LabeledInputField title="Reason" multiline rows={4} />

      <div className="flex justify-end mt-2 gap-2">
        <Button label="Cancel" />
        <Button label="Edit" />
        <Button label="Reschedule" />
      </div>
    </div>
  );
}

export default AppointmentDetailsPage;
