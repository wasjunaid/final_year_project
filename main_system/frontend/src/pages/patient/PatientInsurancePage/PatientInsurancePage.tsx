import { useMemo } from "react";
import type { NavbarConfig } from "../../../models/navbar/model";
import { useNavbarController } from "../../../hooks/ui/navbar";
import { usePatientInsuranceController } from "../../../hooks/insurance";
import type { CreatePatientInsurancePayload } from "../../../models/insurance/payload";
import { AddEditInsurance, InsurancesList } from "./components";

export const PatientInsurancePage = () => {
  const {
    patientInsurances,
    insuranceCompanies,
    loading,
    error,
    success,
    createPatientInsurance,
    deletePatientInsurance,
    verifyPatientInsurance,
    deactivatePatientInsurance,
    clearMessages,
  } = usePatientInsuranceController();

  // Configure navbar with tabs
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: "Insurance",
    tabs: [
      { label: "My Insurances", value: "list" },
      { label: "Add Insurance", value: "add" },
    ],
  }), []);

  const { activeTab = "list", setActiveTab } = useNavbarController(navbarConfig);

  const handleAdd = async (payload: CreatePatientInsurancePayload) => {
    await createPatientInsurance(payload);
  };

  const handleDelete = async (insuranceId: number) => {
    if (confirm("Are you sure you want to delete this insurance?")) {
      await deletePatientInsurance(insuranceId);
    }
  };

  const handleVerify = async (insuranceId: number) => {
    await verifyPatientInsurance(insuranceId);
  };

  const handleDeactivate = async (insuranceId: number) => {
    if (confirm("Are you sure you want to deactivate this insurance?")) {
      await deactivatePatientInsurance(insuranceId);
    }
  };

  const handleCancel = () => {
    setActiveTab("list"); // Go back to list on cancel
  };

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* My Insurances Tab */}
      {activeTab === "list" && (
        <InsurancesList
          patientInsurances={patientInsurances}
          loading={loading}
          error={error}
          success={success}
          onDelete={handleDelete}
          onVerify={handleVerify}
          onDeactivate={handleDeactivate}
          clearMessages={clearMessages}
        />
      )}

      {/* Add Insurance Tab */}
      {activeTab === "add" && (
        <div className="p-6">
          <AddEditInsurance
            insuranceCompanies={insuranceCompanies}
            editingInsurance={null}
            onSubmit={handleAdd}
            onCancel={handleCancel}
            loading={loading}
            error={error}
            success={success}
            clearMessages={clearMessages}
          />
        </div>
      )}
    </div>
  );
};
