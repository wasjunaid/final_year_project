import React from "react";
import type { NavbarConfig } from "../../models/navbar/model";
import { useNavbarController } from "../../hooks/ui/navbar";
import AccessRequestsPage from "./AccessRequestsPage";
import CreateAccessRequestPage from "./CreateAccessRequestPage";

const AccessRequestsDashboard: React.FC = () => {
  const navbarConfig: NavbarConfig = React.useMemo(() => ({
    title: "Access Requests",
    tabs: [
      { label: "Requests", value: "requests" },
      { label: "Create", value: "create" },
    ],
  }), []);
  const { activeTab = "requests" } = useNavbarController(navbarConfig);

  return (
    <div className="flex flex-1 flex-col min-h-full">
      {activeTab === "requests" && (
        <AccessRequestsPage />
      )}
      
      {activeTab === "create" && (
        <CreateAccessRequestPage />
      )}
    </div>
  );
};

export default AccessRequestsDashboard;