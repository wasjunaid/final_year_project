import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";

// Importing icons from react-icons
import {
  // FaHome,
  FaUser,
  FaCalendarAlt,
  // FaShareAlt,
  FaFileAlt,
  FaShare,
  // FaCreditCard,
  FaShieldAlt,
} from "react-icons/fa";
import PatientDemographicsPage from "./PatientDemographicsPage";
import PatientAppointmentsTabLayout from "./PatientAppointmentsTabLayout";
import PatientDasboardTab from "./PatientDasboardTab";
import NotificationPage from "../notification/NotificaitonPage";
import PatientDocumentsTabLayout from "./PatientDocumentsTabLayout";
import EHRAccessRequestsPage from "../ehr/EHRAccessRequestsPage";
import PatientInsurancePage from "../patient_insurance/PatientInsurancesPage";
import PrescriptionsPage from "../prescription/PrescriptionsPage";

function PatientPortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("demographics");

  const sidebarItems: ISideBarItem[] = [
    // { label: "Home", icon: <FaHome />, page: "home" },
    { label: "Demographics", icon: <FaUser />, page: "demographics" },
    { label: "Appointments", icon: <FaCalendarAlt />, page: "appointments" },
    // { label: "Data Sharing", icon: <FaShareAlt />, page: "datasharing" },
    { label: "Insurance", icon: <FaShieldAlt />, page: "insurance" },
    { label: "Documents", icon: <FaFileAlt />, page: "documents" },
    { label: "Prescriptions", icon: <FaFileAlt />, page: "prescriptions" },
    { label: "EHR", icon: <FaShare />, page: "ehr" },
    // { label: "Billing", icon: <FaCreditCard />, page: "billing" },
  ];

  const renderPage = () => {
    switch (selectedPage) {
      case "home":
        return <PatientDasboardTab />;
      case "demographics":
        return <PatientDemographicsPage />;
      case "appointments":
        return <PatientAppointmentsTabLayout />;
      case "datasharing":
        return <h2 className="p-4">🔗 Data Sharing Page</h2>;
      case "insurance":
        return <PatientInsurancePage />;
      case "documents":
        return <PatientDocumentsTabLayout />;
      case "ehr":
        return <EHRAccessRequestsPage />;
      case "billing":
        return <h2 className="p-4">💳 Billing Page</h2>;
      case "prescriptions":
        return <PrescriptionsPage />;
      case "notifications":
        return <NotificationPage />;
      default:
        return <h2 className="p-4">Page Not Found</h2>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <NavBar
        onToggleSidebar={() => setCollapsed(!collapsed)}
        profileImage=""
        onNotificationsClick={() => setSelectedPage("notifications")}
      />

      <div className="flex flex-row flex-1">
        {/* Sidebar */}
        <SideBar
          items={sidebarItems}
          selected={selectedPage}
          onSelect={setSelectedPage}
          collapsed={collapsed}
        />

        {/* Main content */}
        <div className="flex-1 bg-white">{renderPage()}</div>
      </div>
    </div>
  );
}

export default PatientPortalLayout;
