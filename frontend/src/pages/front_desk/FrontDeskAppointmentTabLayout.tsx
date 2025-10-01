import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaCalendarAlt } from "react-icons/fa";
import AppointmentsPage from "../appointments/AppointmentsPage";
import CreateAppointmentPage from "../appointments/CreateAppointmentPage";
import AppointmentRequestsPage from "../appointments/AppointmentRequestsPage";

const PAGE = {
  appointments: "appointments",
  appointmentRequests: "appointmentRequests",
  createAppointment: "createAppointment",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.appointments:
      return <AppointmentsPage />;
    case PAGE.appointmentRequests:
      return <AppointmentRequestsPage />;
    case PAGE.createAppointment:
      return <CreateAppointmentPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function FrontDeskAppointmentsTabLayout() {
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
          label="Appointment Requests"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.appointmentRequests}
          onClick={() => setPage(PAGE.appointmentRequests)}
        />
        {/* <TabButton
          label="Create Apointment"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.createAppointment}
          onClick={() => setPage(PAGE.createAppointment)}
        /> */}
      </div>

      <div className="flex flex-1 flex-col">{renderPage(page)}</div>
    </div>
  );
}

export default FrontDeskAppointmentsTabLayout;
