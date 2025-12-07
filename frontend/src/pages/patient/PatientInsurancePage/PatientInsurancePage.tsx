import { useState, useEffect, useMemo } from "react";
import type { NavbarConfig } from "../../../models/navbar/model";
import { useNavbarController } from "../../../hooks/ui/navbar";
import { usePatientInsuranceController } from "../../../hooks/insurance";
import type { PatientInsuranceModel } from "../../../models/insurance/model";
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
    updatePatientInsurance,
    deletePatientInsurance,
    verifyPatientInsurance,
    clearMessages,
  } = usePatientInsuranceController();

  const [editingInsurance, setEditingInsurance] = useState<PatientInsuranceModel | null>(null);

  // Configure navbar with tabs
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: "Insurance",
    tabs: [
      { label: "My Insurances", value: "list" },
      { label: "Add Insurance", value: "add" },
    ],
  }), []);

  const { activeTab = "list", setActiveTab } = useNavbarController(navbarConfig);

  // Reset editing state when tab changes to list
  useEffect(() => {
    if (activeTab === "list") {
      setEditingInsurance(null);
    }
  }, [activeTab]);

  const handleAdd = async (payload: CreatePatientInsurancePayload) => {
    await createPatientInsurance(payload);
  };

  const handleEdit = (insurance: PatientInsuranceModel) => {
    setEditingInsurance(insurance);
    setActiveTab("add"); // Switch to Add Insurance tab when editing
  };

  const handleUpdate = async (payload: CreatePatientInsurancePayload) => {
    if (editingInsurance) {
      // Only is_primary can be updated
      await updatePatientInsurance(editingInsurance.patient_insurance_id, {
        is_primary: payload.is_primary,
      });
      setEditingInsurance(null);
      setActiveTab("list"); // Go back to list after update
    }
  };

  const handleDelete = async (insuranceId: number) => {
    if (confirm("Are you sure you want to delete this insurance?")) {
      await deletePatientInsurance(insuranceId);
    }
  };

  const handleVerify = async (insuranceId: number) => {
    await verifyPatientInsurance(insuranceId);
  };

  const handleCancel = () => {
    setEditingInsurance(null);
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          onVerify={handleVerify}
          clearMessages={clearMessages}
        />
      )}

      {/* Add Insurance Tab */}
      {activeTab === "add" && (
        <div className="p-6">
          <AddEditInsurance
            insuranceCompanies={insuranceCompanies}
            editingInsurance={editingInsurance}
            onSubmit={editingInsurance ? handleUpdate : handleAdd}
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
