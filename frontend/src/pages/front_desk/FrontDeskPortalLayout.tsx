import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";

// Importing icons from react-icons
import FrontDeskAppointmentTabLayout from "./FrontDeskAppointmentTabLayout";
import FrontDeskDocumentsLayout from "./FrontDeskDocumentsLayout";
import NotificationPage from "../notification/NotificaitonPage";
import { FaCalendarAlt, FaFileAlt } from "react-icons/fa";

function FrontDeskPortalLayout() {
  const role = useUserRole();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("appointments");

  // Check if user has front desk access
  const isFrontDesk = role === ROLES.HOSPITAL_FRONT_DESK;
  
  if (!isFrontDesk) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only hospital front desk staff can access this area</p>
        </div>
      </div>
    );
  }

  const sidebarItems: ISideBarItem[] = [
    // { label: "Profile", icon: <FaUser />, page: "profile" },
    { label: "Appointments", icon: <FaCalendarAlt />, page: "appointments" },
    { label: "Documents", icon: <FaFileAlt />, page: "documents" },
  ];

  const renderPage = () => {
    switch (selectedPage) {
      case "profile":
        return <h2 className="p-4">👤 Demographics Page</h2>;
      case "appointments":
        return <FrontDeskAppointmentTabLayout />;
      case "documents":
        return <FrontDeskDocumentsLayout />;
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

export default FrontDeskPortalLayout;
