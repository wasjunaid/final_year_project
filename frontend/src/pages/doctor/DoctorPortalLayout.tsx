import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";
import {
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaShare,
  FaHospitalUser,
} from "react-icons/fa";
import DoctorProfile from "./DoctorProfile";
import AppointmentsPage from "../appointments/AppointmentsPage";
import NotificationPage from "../notification/NotificaitonPage";
import AssociationRequestsPage from "../association_request/AssociationRequestsPage";
import DoctorEHRTabLayout from "./DoctorEHRTabLayout";
import PrescriptionsPage from "../prescription/PrescriptionsPage";
import DocumentsPage from "../documents/DocumentsPage";

function DoctorPortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("profile");

  const sidebarItems: ISideBarItem[] = [
    { label: "Profile", icon: <FaUser />, page: "profile" },
    { label: "Appointments", icon: <FaCalendarAlt />, page: "appointments" },
    { label: "Associations", icon: <FaHospitalUser />, page: "association-requests" },
    { label: "Prescriptions", icon: <FaFileAlt />, page: "prescriptions" },
    { label: "EHR", icon: <FaShare />, page: "ehr" },
    { label: "Personal Docs", icon: <FaFileAlt />, page: "personal-docs" },
  ];

  const renderPage = () => {
    switch (selectedPage) {
      case "profile":
        return <DoctorProfile />;
      case "appointments":
        return <AppointmentsPage />;
      case "association-requests":
        return <AssociationRequestsPage />;
      case "ehr":
        return <DoctorEHRTabLayout />;
      case "personal-docs":
        return <DocumentsPage />;
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

export default DoctorPortalLayout;
