import type React from "react";
import type { NavbarConfig } from "../../models/navbar/model";
import { useEffect, useMemo } from "react";
import { useNavbarController } from "../../hooks/ui/navbar";
import AppointmentsPage from "./AppointmentsPage";
import CreateAppointmentPage from "./CreateAppointmentPage";
import AppointmentsDetailsPage from "./AppointmentDetailsPage";
import { useAuthController } from "../../hooks/auth";
import { ROLES } from "../../constants/profile";

const AppointmentsDashboard: React.FC = () => {
  const { role } = useAuthController();

  const patientNavbarConfig: NavbarConfig = useMemo(() => ({
    title: "Appointments",
    initialActiveTab: "appointments",
    tabs: [
      { label: "Appointments", value: "appointments" },
      { label: "Create", value: "create" },
      // { label: "Details", value: "details" },
    ]
  }), []);

  const hospitalNavbarConfig: NavbarConfig = useMemo(() => ({
    title: "Appointments",
    initialActiveTab: "appointments",
    tabs: [
      { label: "Appointments", value: "appointments" },
      // { label: "Details", value: "details" },
    ]
  }), []);

  const { setConfig, activeTab, setActiveTab } = useNavbarController();

  useEffect(() => {
    switch (role) {
      case ROLES.PATIENT:
        setConfig(patientNavbarConfig);
        break;
      case ROLES.HOSPITAL_ADMIN:
      case ROLES.HOSPITAL_SUB_ADMIN:
      case ROLES.HOSPITAL_FRONT_DESK:
      case ROLES.DOCTOR:
        setConfig(hospitalNavbarConfig);
        break;
      default:
        setConfig(hospitalNavbarConfig);
    }
    
    // Ensure activeTab is set to a valid tab after config is set
    if (!activeTab || (activeTab !== 'appointments' && activeTab !== 'create' && activeTab !== 'details')) {
      setActiveTab('appointments');
    }
  } , [role, patientNavbarConfig, hospitalNavbarConfig, setConfig, activeTab, setActiveTab]);

  // const [selectedAppointment, setSelectedAppointment] = useState<AppointmentModel | null>(null);

  return (
    <div className="flex flex-1 flex-col min-h-full">
      {(activeTab === "appointments" || !activeTab) && (
        <AppointmentsPage />
      )}

      {activeTab === 'details' && (
        <AppointmentsDetailsPage />
      )}

      {activeTab === "create" && role === ROLES.PATIENT && (
        <CreateAppointmentPage />
      )}
    </div>
  )
}

export default AppointmentsDashboard;