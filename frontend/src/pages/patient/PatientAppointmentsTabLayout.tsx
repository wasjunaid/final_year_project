import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaCalendarAlt } from "react-icons/fa";
import AppointmentsPage from "../appointments/AppointmentsPage";
import CreateAppointmentPage from "../appointments/CreateAppointmentPage";

const PAGE = {
  appointments: "appointments",
  createAppointment: "createAppointment",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.appointments:
      return <AppointmentsPage />;
    case PAGE.createAppointment:
      return <CreateAppointmentPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function PatientAppointmentsTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.appointments);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Appointments"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.appointments}
          onClick={() => setPage(PAGE.appointments)}
        />
        <TabButton
          label="Create Apointment"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.createAppointment}
          onClick={() => setPage(PAGE.createAppointment)}
        />
      </div>

      <div className="flex flex-1 flex-col">{renderPage(page)}</div>
    </div>
  );
}

export default PatientAppointmentsTabLayout;
