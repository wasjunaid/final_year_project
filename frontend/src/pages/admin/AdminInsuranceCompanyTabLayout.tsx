import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaBuilding } from "react-icons/fa";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import InsuranceCompaniesPage from "../Insurance_company/InsuranceCompaniesPage";
import CreateInsuranceCompanyPage from "../Insurance_company/CreateInsuranceCompanyPage";

const PAGE = {
  insuranceCompanies: "insuranceCompanies",
  createInsuranceCompany: "createInsuranceCompany",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.insuranceCompanies:
      return <InsuranceCompaniesPage />;
    case PAGE.createInsuranceCompany:
      return <CreateInsuranceCompanyPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function AdminInsuranceCompanyTabLayout() {
  const role = useUserRole();
  const [page, setPage] = useState<PAGE>(PAGE.insuranceCompanies);

  const isSystemAdmin = role === ROLES.SUPER_ADMIN;
  const isSystemSubAdmin = role === ROLES.ADMIN;
  const hasAdminAccess = isSystemAdmin || isSystemSubAdmin;

  if (!hasAdminAccess) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only system administrators can access this area</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Insurance Companies"
          icon={<FaBuilding />}
          selected={page === PAGE.insuranceCompanies}
          onClick={() => setPage(PAGE.insuranceCompanies)}
        />
        <TabButton
          label="Create Insurance Company"
          icon={<FaBuilding />}
          selected={page === PAGE.createInsuranceCompany}
          onClick={() => setPage(PAGE.createInsuranceCompany)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default AdminInsuranceCompanyTabLayout;
