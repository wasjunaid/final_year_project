import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";
import { FaShareAlt, FaHospital, FaPills } from "react-icons/fa";
import AdminHospitalsTabLayout from "./AdminHospitalsTabLayout";
import AdminHospitalStaffTabLayout from "./AdminHosptalStaffTabLayout";
import NotificationPage from "../notification/NotificaitonPage";
import AdminAdminsTabLayout from "./AdminAdminsTabLayout";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import LogsPage from "../logs/LogsPage";
import AdminInsuranceCompanyTabLayout from "./AdminInsuranceCompanyTabLayout";
import MedicinesListPage from "../medicine/MedicinesListPage";

function AdminPortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("dataaccess");

  const { user } = useAuth();

  // Always show Data Access
  const sidebarItems: ISideBarItem[] = [
    { label: "Data Access", icon: <FaShareAlt />, page: "dataaccess" },
  ];

  // Show medicines for both super admin and admin
  if (user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN) {
    sidebarItems.push({label: "Medicines", icon: <FaPills />, page: "medicines"});
  }

  // Only show these if SUPER_ADMIN
  if (user?.role === ROLES.SUPER_ADMIN) {
    sidebarItems.push(
      {label: "Admins", icon: <FaHospital />, page: "admins"},
      {label: "Insurance", icon: <FaHospital />, page: "insurance_companies"},
      {label: "Hospitals", icon: <FaHospital />, page: "hospitals"},
      {label: "Hospital Staff", icon: <FaHospital />, page: "hospital_staff"}
    );
  }

  const renderPage = () => {
    switch (selectedPage) {
      case "dataaccess":
        return <LogsPage />;
      case "medicines":
        return <MedicinesListPage />;
      case "admins":
        return <AdminAdminsTabLayout />;
      case "insurance_companies":
        return <AdminInsuranceCompanyTabLayout />;
      case "hospitals":
        return <AdminHospitalsTabLayout />;
      case "hospital_staff":
        return <AdminHospitalStaffTabLayout />;
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
