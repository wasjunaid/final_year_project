import React, { useMemo } from "react";
import Alert from "../../../components/Alert";
import { ROLES } from "../../../constants/profile";
import { useAuthController } from "../../../hooks/auth";
import type { NavbarConfig } from "../../../models/navbar/model";
import { useNavbarController } from "../../../hooks/ui/navbar";
import LabTestList from "./components/LabTestList";
import CreateLabTest from "./components/CreateLabTest";

const LabTestDashboard: React.FC = () => {
  const { role } = useAuthController();
  if (role !== ROLES.HOSPITAL_ADMIN && role !== ROLES.HOSPITAL_SUB_ADMIN) {
    return <Alert type="error" title="Access Forbidden" message="This page is not accessible by current role" />;
  }

  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: "Lab Test Dashboard",
    initialActiveTab: "lab-tests",
    tabs: [
      { label: "Lab Tests", value: "lab-tests" },
      { label: "Create Lab Test", value: "create-lab-test" },
    ],
  }), []);

  const { activeTab = "lab-tests" } = useNavbarController(navbarConfig);
  
  return (
    <div className="flex flex-1 flex-col min-h-full">
      {activeTab === "lab-tests" && (
        <LabTestList />
      )}

      {activeTab === "create-lab-test" && (
        <CreateLabTest />
      )}
    </div>
  );
}

export default LabTestDashboard;