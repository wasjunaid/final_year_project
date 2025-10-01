import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";

// Importing icons from react-icons
import {
  FaHospital,
  FaCalendarAlt,
  FaFileMedical,
  FaUsers,
} from "react-icons/fa";
import AppointmentsPage from "../appointments/AppointmentsPage";
import NotificationPage from "../notification/NotificaitonPage";
import HospitalAccountsTabLayout from "./HospitalAccountsTabLayout";
import HospitalProfile from "./HospitalProfile";

function HospitalPortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("hospital");

  const sidebarItems: ISideBarItem[] = [
    { label: "Hospital", icon: <FaHospital />, page: "hospital" },
    { label: "Appointments", icon: <FaCalendarAlt />, page: "appointments" },
    { label: "Pannel", icon: <FaFileMedical />, page: "pannel" },
    // { label: "Doctors", icon: <FaUserMd />, page: "doctors" },
    // { label: "Coders", icon: <FaUserCog />, page: "coders" },
    { label: "Accounts", icon: <FaUsers />, page: "accounts" },
  ];

  const renderPage = () => {
    switch (selectedPage) {
      case "hospital":
        return <HospitalProfile/>;
      case "appointments":
        return <AppointmentsPage />;
      case "pannel":
        return <h2 className="p-4">🧾 Insurances Page</h2>;
      case "doctors":
        return <h2 className="p-4">👨‍⚕️ Doctors Page</h2>;
      case "coders":
        return <h2 className="p-4">💻 Coders Page</h2>;
      case "accounts":
        return <HospitalAccountsTabLayout />;
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

export default HospitalPortalLayout;
