import { useState } from "react";
import {
  FaShieldAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { usePatientInsurance } from "../../hooks/usePatientInsurance";
import { useUserRole } from "../../hooks/useUserRole";
import DataTable from "../../components/DataTable";
import type { IDataTableColumnProps, IDataTableButtonProps } from "../../components/DataTable";
import EditPatientInsuranceModal from "./components/EditPatientInsuranceModal";
import CreatePatientInsuranceModal from "./components/CreatePatientInsuranceModal";
import type { PatientInsurance } from "../../models/PatientInsurance";
import { ROLES } from "../../constants/roles"; // <-- Make sure this path is correct

function PatientInsurancePage() {
  const role = useUserRole();
  const {
    items,
    loading,
    error,
    success,
    remove,
    hasItems,
  } = usePatientInsurance();

  const [editingInsurance, setEditingInsurance] = useState<PatientInsurance | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isPatient = role === ROLES.PATIENT;
  const isAdmin = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
  const hasAccess = isPatient || isAdmin;

  const handleDeleteInsurance = async (insurance: PatientInsurance) => {
    if (!window.confirm(`Are you sure you want to delete insurance #${insurance.insurance_number}?\n\nThis action cannot be undone.`)) {
      return;
    }
    await remove(insurance.patient_insurance_id);
  };

  const handleEditInsurance = (insuranceId: number) => {
    const insurance = items.find((i: PatientInsurance) => i.patient_insurance_id === insuranceId);
    if (insurance) {
      setEditingInsurance(insurance);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSuccess = async () => {
    setIsEditModalOpen(false);
    setEditingInsurance(null);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingInsurance(null);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const getCompanyName = (insurance: PatientInsurance): string => {
    return insurance.insurance_company_name || "Insurance Company";
  };

  const columns: IDataTableColumnProps<PatientInsurance>[] = [
    {
      key: "insurance_number",
      label: "Policy Number",
      render: (insurance: PatientInsurance) => (
        <span className="text-sm font-medium text-gray-900">
          #{insurance.insurance_number}
        </span>
      ),
    },
    {
      key: "company",
      label: "Insurance Company",
      render: (insurance: PatientInsurance) => (
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">
            {getCompanyName(insurance)}
          </div>
        </div>
      ),
    },
    {
      key: "is_verified",
      label: "Status",
      render: (insurance: PatientInsurance) => (
        <div className="flex items-center gap-2">
          {insurance.is_verified ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <FaCheckCircle className="mr-1" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <FaExclamationTriangle className="mr-1" />
              Pending
            </span>
          )}
        </div>
      ),
    },
    // {
    //   key: "created_at",
    //   label: "Added Date",
    //   render: (insurance: PatientInsurance) => (
    //     <div className="text-sm text-gray-500">
    //       <div>
    //         {new Date(insurance.created_at).toLocaleDateString("en-US", {
    //           year: "numeric",
    //           month: "short",
    //           day: "numeric",
    //         })}
    //       </div>
    //       <div className="text-xs text-gray-400">
    //         {new Date(insurance.created_at).toLocaleTimeString("en-US", {
    //           hour: "2-digit",
    //           minute: "2-digit",
    //         })}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      key: "actions",
      label: "Actions",
      render: (insurance: PatientInsurance) => (
        <div className="flex justify-end gap-2">
          {hasAccess && (
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditInsurance(insurance.patient_insurance_id);
                }}
                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                title="Edit Insurance"
              >
                <FaEdit />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteInsurance(insurance);
                }}
                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                title="Delete Insurance"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const filterButtons: IDataTableButtonProps[] = [
    { label: "All Insurances", value: "All", icon: <FaShieldAlt /> },
    { label: "Verified", value: "Verified", icon: <FaCheckCircle /> },
    { label: "Pending", value: "Pending", icon: <FaExclamationTriangle /> },
  ];

  const transformedInsurances = items.map((insurance: PatientInsurance) => ({
    ...insurance,
    status: insurance.is_verified ? "Verified" : "Pending",
  }));

  const verifiedInsuranceCount = items.filter((i: PatientInsurance) => i.is_verified).length;
  const insuranceCount = items.length;

  if (!hasAccess) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>You don't have permission to view patient insurance information</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading patient insurances...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              My Insurance Coverage
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your insurance policies ({insuranceCount} total)
            </p>
          </div>
          {hasAccess && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaPlus />
              Add Insurance
            </button>
          )}
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
        {hasItems && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {verifiedInsuranceCount}
                  </div>
                  <div className="text-sm text-green-700">
                    Verified Policies
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaShieldAlt className="text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {insuranceCount}
                  </div>
                  <div className="text-sm text-purple-700">Total Policies</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Empty State */}
        {!loading && !hasItems && (
          <div className="text-center text-gray-500 py-12">
            <FaShieldAlt className="mx-auto text-4xl mb-4 text-gray-300" />
            <p className="text-lg mb-2">No insurance coverage found</p>
            <p className="text-sm">
              Add your insurance policies to manage your coverage
            </p>
            {hasAccess && (
              <div className="mt-4">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaPlus />
                  Add First Insurance
                </button>
              </div>
            )}
          </div>
        )}
        {/* DataTable */}
        {hasItems && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <DataTable
                columns={columns}
                data={transformedInsurances}
                buttons={filterButtons}
                defaultFilter="All"
                filterKey="status"
                searchable={true}
                searchPlaceholder="Search insurance policies..."
              />
            </div>
          </div>
        )}
      </div>
      {/* Edit Insurance Modal */}
        {editingInsurance && (
          <EditPatientInsuranceModal
            isOpen={isEditModalOpen}
            onClose={handleEditModalClose}
            insurance={editingInsurance}
            // onSuccess={handleEditSuccess}
          />
        )}
        {/* Create Insurance Modal */}
      <CreatePatientInsuranceModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={() => {}}
      />
    </>
  );
}

export default PatientInsurancePage;
