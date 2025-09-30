import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";

// Importing icons from react-icons
import { FaShareAlt, FaHospital } from "react-icons/fa";
import AdminHospitalsTabLayout from "./AdminHospitalsTabLayout";
import AdminHospitalStaffTabLayout from "./AdminHosptalStaffTabLayout";
import NotificationPage from "../notification/NotificaitonPage";
import AdminDataSharingTabLayout from "./AdminDataSharingTabLayout";
import AdminAdminsTabLayout from "./AdminAdminsTabLayout";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";

function AdminPortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("dataaccess");

  const { user } = useAuth();

  // Always show Data Access
  const sidebarItems: ISideBarItem[] = [
    { label: "Data Access", icon: <FaShareAlt />, page: "dataaccess" },
  ];

  // Only show these if SUPER_ADMIN
  if (user?.role === ROLES.SUPER_ADMIN) {
    sidebarItems.push(
      { label: "Admins", icon: <FaHospital />, page: "admins" },
      { label: "Hospitals", icon: <FaHospital />, page: "hospitals" },
      { label: "Hospital Staff", icon: <FaHospital />, page: "hospital_staff" }
    );
  }

  const renderPage = () => {
    switch (selectedPage) {
      case "hospitals":
        return <AdminHospitalsTabLayout />;
      case "admins":
        return <AdminAdminsTabLayout />;
      case "hospital_staff":
        return <AdminHospitalStaffTabLayout />;
      case "dataaccess":
        return <AdminDataSharingTabLayout />;
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

export default AdminPortalLayout;
