import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useInsuranceCompanies } from "../../hooks/useInsuranceCompanies";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";

function CreateInsuranceCompanyPage() {
  const role = useUserRole();
  const {
    loading,
    error,
    success,
    create,
    clearMessages,
    count,
  } = useInsuranceCompanies();

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  // Check if user has admin privileges
  const isSystemAdmin = role === ROLES.SUPER_ADMIN;
  const isSystemSubAdmin = role === ROLES.ADMIN;
  const hasAdminAccess = isSystemAdmin || isSystemSubAdmin;

  // Handle create company
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const success = await create({ name: companyName.trim(), email: companyEmail.trim() });
    if (success) {
      setCompanyName("");
      setCompanyEmail("");
    }
  };

  if (!hasAdminAccess) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only system administrators can manage insurance companies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Insurance Company Management
        </h1>
        <p className="text-gray-600 text-sm">
          Create and manage insurance companies in the system ({count} companies)
        </p>
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

      {/* Create Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <FaPlus className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Insurance Company
            </h2>
          </div>

          <form onSubmit={handleCreateCompany} className="space-y-4">
            <LabeledInputField
              title="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter insurance company name (e.g., Blue Cross Blue Shield)"
              required
              hint="Company name must be unique and between 2-255 characters"
            />
            <LabeledInputField
              title="Company Email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="Enter company email (e.g., info@bluecross.com)"
              required
              hint="A valid email address is required"
              type="email"
            />

            <div className="flex gap-4">
              <Button
                label={loading ? "Creating..." : "Create Company"}
                icon={<FaPlus />}
                type="submit"
                disabled={loading || !companyName.trim() || !companyEmail.trim()}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateInsuranceCompanyPage;
