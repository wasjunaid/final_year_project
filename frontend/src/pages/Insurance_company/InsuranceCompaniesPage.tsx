import { useState } from "react";
import { FaBuilding, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useInsuranceCompanies } from "../../hooks/useInsuranceCompanies";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import DataTable from "../../components/DataTable";
import EditInsuranceCompanyModal from "./components/EditInsuranceCompanyModal";
import type { InsuranceCompany } from "../../models/InsuranceCompany";
import type {
  IDataTableColumnProps,
  IDataTableButtonProps,
} from "../../components/DataTable";

function InsuranceCompaniesPage() {
  const role = useUserRole();
  const {
    items: companies,
    loading,
    error,
    success,
  // updateCompany removed (not used directly)
  // createCompany removed (not used)
    remove: deleteCompany,
    hasItems: hasCompanies,
    count: companyCount,
  } = useInsuranceCompanies();

  // Modal state for editing
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if user has admin privileges for edit/delete actions
  const isSystemAdmin = role === ROLES.SUPER_ADMIN;
  const isSystemSubAdmin = role === ROLES.ADMIN;
  const hasAdminAccess = isSystemAdmin || isSystemSubAdmin;

  // Handle edit company - open modal instead of navigation
  const handleEditCompany = (companyId: number) => {
    const company = companies.find((c) => c.insurance_company_id === companyId);
    if (company) {
      setEditingCompany(company);
      setIsEditModalOpen(true);
    }
  };

  // Handle delete company (delete is not available, but keep for UI completeness)
  const handleDeleteCompany = async (company: InsuranceCompany) => {
    await deleteCompany(company.insurance_company_id);
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingCompany(null);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    // The hook will automatically update the companies list
    // Modal will close automatically via handleEditModalClose
  };

  // DataTable columns configuration
  const columns: IDataTableColumnProps<InsuranceCompany>[] = [
    {
      key: "insurance_company_id",
      label: "ID",
      render: (company) => (
        <span className="text-sm font-medium text-gray-900">
          #{company.insurance_company_id}
        </span>
      ),
    },
    {
      key: "name",
      label: "Company Name",
      render: (company) => (
        <div className="text-sm font-medium text-gray-900">{company.name}</div>
      ),
    },
    {
      key: "created_at",
      label: "Created Date",
      render: (company) => (
        <div className="text-sm text-gray-500">
          <div>
            {new Date(company.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(company.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "updated_at",
      label: "Last Updated",
      render: (company) => (
        <div className="text-sm text-gray-500">
          {company.updated_at !== company.created_at ? (
            <div>
              {new Date(company.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              <div className="text-xs text-gray-400">
                {new Date(company.updated_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Not modified</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (company) => (
        <div className="flex justify-end gap-2">
          {hasAdminAccess && (
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click when clicking edit
                  handleEditCompany(company.insurance_company_id);
                }}
                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                title="Edit Company"
              >
                <FaEdit />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click when clicking delete
                  handleDeleteCompany(company);
                }}
                // disabled={deleting} // delete not supported
                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete Company"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  // DataTable filter buttons
  const filterButtons: IDataTableButtonProps[] = [
    { label: "All Companies", value: "All", icon: <FaBuilding /> },
    { label: "Recently Added", value: "Recent", icon: <FaPlus /> },
    { label: "Updated", value: "Updated", icon: <FaEdit /> },
  ];

  // Transform data for filtering
  const transformedCompanies = companies.map((company) => {
    const isRecent = (() => {
      const created = new Date(company.created_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    })();

    const isUpdated = company.updated_at !== company.created_at;

    return {
      ...company,
      status: isRecent ? "Recent" : isUpdated ? "Updated" : "All",
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading insurance companies...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-600 text-sm">
              Browse all insurance companies in the system ({companyCount}{" "}
              total)
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Statistics */}
        {hasCompanies && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaBuilding className="text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {companyCount}
                  </div>
                  <div className="text-sm text-blue-700">Total Companies</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaPlus className="text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {
                      companies.filter((c) => {
                        const created = new Date(c.created_at);
                        const today = new Date();
                        const diffTime = Math.abs(
                          today.getTime() - created.getTime()
                        );
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24)
                        );
                        return diffDays <= 30;
                      }).length
                    }
                  </div>
                  <div className="text-sm text-green-700">Added This Month</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaEdit className="text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {
                      companies.filter((c) => c.updated_at !== c.created_at)
                        .length
                    }
                  </div>
                  <div className="text-sm text-purple-700">
                    Recently Updated
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !hasCompanies && (
          <div className="text-center text-gray-500 py-12">
            <FaBuilding className="mx-auto text-4xl mb-4 text-gray-300" />
            <p className="text-lg mb-2">No insurance companies found</p>
            <p className="text-sm">
              There are no insurance companies in the system yet
            </p>
          </div>
        )}

        {/* DataTable */}
        {hasCompanies && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <DataTable
                columns={columns}
                data={transformedCompanies}
                buttons={filterButtons}
                defaultFilter="All"
                filterKey="status"
                searchable={true}
                searchPlaceholder="Search insurance companies..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit Insurance Company Modal */}
      <EditInsuranceCompanyModal
        company={editingCompany}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
  // updateCompany={updateCompany} // modal uses its own hook
      />
    </>
  );
}

export default InsuranceCompaniesPage;
