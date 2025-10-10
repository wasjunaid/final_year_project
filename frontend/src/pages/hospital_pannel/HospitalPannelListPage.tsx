import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import DataTable, {
  type IDataTableColumnProps,
} from "../../components/DataTable";
// import useHospitalPannel from "../../hooks/useHospitalPannel";

import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
// import { useAuth } from "../../hooks/useAuth";
import { InsuranceCompanyApi } from "../../services/insuranceCompaniesApi";
import type { InsuranceCompany } from "../../models/InsuranceCompany";
import { useHospitalPannel } from "../../hooks/useHospitalPannel";
import AddPanelCompanyModal from "./components/AddPanelCompanyModal";
import Button from "../../components/Button";

function HospitalPannelListPage() {
  //   const { user } = useAuth();
  const role = useUserRole();
  const isHospitalAdmin =
    role === ROLES.HOSPITAL_ADMIN || role === ROLES.HOSPITAL_SUB_ADMIN;

  const {
    panels,
    loading,
    error,
    success,
    fetchPanels,
    insertPanel,
    removePanel,
  } = useHospitalPannel();

  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await InsuranceCompanyApi.getInsuranceCompanies();
        setCompanies(res.data || []);
      } catch {
        setCompanies([]);
      }
    })();
  }, []);

  if (!isHospitalAdmin) {
    return <div className="p-6">Unauthorized — hospital admin only.</div>;
  }

  const handleAdd = async (insurance_company_id: number) => {
    await insertPanel({ insurance_company_id });
    // refresh list after insert
    await fetchPanels();
  };

  const columns: IDataTableColumnProps<any>[] = [
    {
      key: "company",
      label: "Company",
      render: (p: any) => {
        const company = companies.find(
          (c) => c.insurance_company_id === p.insurance_company_id
        );
        return company?.name || `#${p.insurance_company_id}`;
      },
    },
    {
      key: "created_at",
      label: "Added",
      render: (p: any) =>
        p.created_at ? new Date(p.created_at).toLocaleDateString() : "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (p: any) => (
        <Button
          label="Remove"
          icon={<FaTrash />}
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            removePanel(p.hospital_panel_list_id);
          }}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between gap-2 items-center mb-4">
        <h2 className="text-lg font-semibold mb-4">Hospital Panel List</h2>
        <Button
          icon={<FaPlus />}
          label="Add Company"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded"
        />
      </div>

      <AddPanelCompanyModal
        isOpen={isAddModalOpen}
        companies={companies}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
        loading={loading}
      />

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <DataTable columns={columns} data={panels} searchable={false} />
    </div>
  );
}

export default HospitalPannelListPage;
