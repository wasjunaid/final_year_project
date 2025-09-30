import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";

// Importing icons from react-icons
import {
  FaHome,
  FaUser,
  FaCalendarAlt,
  FaShareAlt,
  FaFileAlt,
  FaCreditCard,
  FaHospital,
} from "react-icons/fa";
import AdminHospitalsTabLayout from "./AdminHospitalsTabLayout";

function AdminPortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("home");

  const sidebarItems: ISideBarItem[] = [
    { label: "Home", icon: <FaHome />, page: "home" },
    { label: "Demographics", icon: <FaUser />, page: "demographics" },
    { label: "Appointments", icon: <FaCalendarAlt />, page: "appointments" },
    { label: "Data Sharing", icon: <FaShareAlt />, page: "datasharing" },
    { label: "Hospitals", icon: <FaHospital />, page: "hospitals" },
    { label: "EHR", icon: <FaFileAlt />, page: "ehr" },
    { label: "Billing", icon: <FaCreditCard />, page: "billing" },
  ];

  const renderPage = () => {
    switch (selectedPage) {
      case "home":
        return <h2 className="p-4">🏠 Home Page</h2>;
      case "demographics":
        return <h2 className="p-4">👤 Demographics Page</h2>;
      case "appointments":
        return <h2 className="p-4">📅 Appointments Page</h2>;
      case "hospitals":
        return <AdminHospitalsTabLayout />;
      case "datasharing":
        return <h2 className="p-4">🔗 Data Sharing Page</h2>;
      case "ehr":
        return <h2 className="p-4">📄 EHR Page</h2>;
      case "billing":
        return <h2 className="p-4">💳 Billing Page</h2>;
      case "notifications":
        return <h2 className="p-4">💳 Notifications</h2>;
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

export default AdminPortalLayout;
