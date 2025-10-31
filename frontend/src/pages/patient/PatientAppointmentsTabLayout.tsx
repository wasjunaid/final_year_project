import { useState, useCallback, useMemo } from "react";
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

function PatientAppointmentsTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.appointments);

  // Memoize page rendering to prevent unnecessary re-renders
  const renderPage = useCallback((currentPage: PAGE) => {
    switch (currentPage) {
      case PAGE.appointments:
        return <AppointmentsPage />;
      case PAGE.appointmentRequests:
        return <AppointmentRequestsPage />;
      case PAGE.createAppointment:
        return <CreateAppointmentPage />;
      default:
        return <h1>Not found!</h1>;
    }
  }, []);

  // Memoize tab buttons to prevent unnecessary re-creation
  const tabButtons = useMemo(() => [
    {
      label: "Appointments",
      icon: <FaCalendarAlt />,
      page: PAGE.appointments,
    },
    {
      label: "Appointment Requests", 
      icon: <FaCalendarAlt />,
      page: PAGE.appointmentRequests,
    },
    {
      label: "Create Appointment",
      icon: <FaCalendarAlt />,
      page: PAGE.createAppointment,
    },
  ], []);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        {tabButtons.map((button) => (
          <TabButton
            key={button.page}
            label={button.label}
            icon={button.icon}
            selected={page === button.page}
            onClick={() => setPage(button.page)}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col">{renderPage(page)}</div>
    </div>
  );
}

export default PatientAppointmentsTabLayout;
