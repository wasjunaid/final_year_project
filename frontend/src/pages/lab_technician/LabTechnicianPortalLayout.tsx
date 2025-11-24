import { useState } from "react";
import NavBar from "../../components/NavBar";
import SideBar, { type ISideBarItem } from "../../components/Sidebar";
import { FaFileAlt } from "react-icons/fa";
import NotificationPage from "../notification/NotificaitonPage";
import UploadVerifiedDocumentPage from "../documents/UploadVerifiedDocumentPage";

function LabTechnicianPortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("docs");

  const sidebarItems: ISideBarItem[] = [
    { label: "Upload Docs", icon: <FaFileAlt />, page: "docs" },
  ];

  const renderPage = () => {
    switch (selectedPage) {
      case "docs":
        return <UploadVerifiedDocumentPage />;
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

export default LabTechnicianPortalLayout;
