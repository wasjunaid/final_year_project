import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";
import { FaUser, FaCalendarAlt, FaFileAlt } from "react-icons/fa";

function DoctorPortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("profile");

  const sidebarItems: ISideBarItem[] = [
    { label: "Profile", icon: <FaUser />, page: "profile" },
    { label: "Appointments", icon: <FaCalendarAlt />, page: "appointments" },
    { label: "Personal Docs", icon: <FaFileAlt />, page: "personal-docs" },
  ];

  const renderPage = () => {
    switch (selectedPage) {
      case "profile":
        return <h2 className="p-4">👤 Profile Page</h2>;
      case "appointments":
        return <h2 className="p-4">📅 Appointments Page</h2>;
      case "personal-docs":
        return <h2 className="p-4">📄 Personal Docs Page</h2>;
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

export default DoctorPortalLayout;
