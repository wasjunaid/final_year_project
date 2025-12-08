import { useMemo } from "react";
import type { NavbarConfig } from "../../models/navbar/model";
import { useNavbarController } from "../../hooks/ui/navbar";
import { UploadVerifiedDocument } from "./components/UploadVerifiedDocument";

export const HospitalStaffManagementPage: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Upload Unverified Document',
  }), []);

  useNavbarController(navbarConfig);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <UploadVerifiedDocument />
    </div>
  );
};

export default HospitalStaffManagementPage;
