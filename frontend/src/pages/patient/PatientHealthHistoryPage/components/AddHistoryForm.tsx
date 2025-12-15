import React, { useState, useCallback } from 'react';
import Dropdown from '../../../../components/Dropdown';
import TextInput from '../../../../components/TextInput';
import Button from '../../../../components/Button';
import Alert from '../../../../components/Alert';
import { 
  useMedicalHistoryController, 
  useAllergyController, 
  useFamilyHistoryController, 
  useSurgicalHistoryController 
} from '../../../../hooks/patient';

type HistoryType = 'medical' | 'allergy' | 'family' | 'surgical';

const AddHistoryForm: React.FC = () => {
  const medCtrl = useMedicalHistoryController();
  const allergyCtrl = useAllergyController();
  const familyCtrl = useFamilyHistoryController();
  const surgicalCtrl = useSurgicalHistoryController();

  const [historyType, setHistoryType] = useState<HistoryType>('medical');
  const [conditionName, setConditionName] = useState('');
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [allergyName, setAllergyName] = useState('');
  const [familyCondition, setFamilyCondition] = useState('');
  const [surgeryName, setSurgeryName] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');

  const getCurrentController = () => {
    switch (historyType) {
      case 'medical': return medCtrl;
      case 'allergy': return allergyCtrl;
      case 'family': return familyCtrl;
      case 'surgical': return surgicalCtrl;
    }
  };

  const resetForm = () => {
    setConditionName('');
    setDiagnosisDate('');
    setAllergyName('');
    setFamilyCondition('');
    setSurgeryName('');
    setSurgeryDate('');
  };

  const handleSubmit = useCallback(async () => {
    try {
      switch (historyType) {
        case 'medical':
          if (!conditionName) return;
          await medCtrl.createMedicalHistoryForPatient({
            condition_name: conditionName,
            diagnosis_date: diagnosisDate || undefined,
          });
          break;
        case 'allergy':
          if (!allergyName) return;
          await allergyCtrl.createAllergyForPatient({ allergy_name: allergyName });
          break;
        case 'family':
          if (!familyCondition) return;
          await familyCtrl.createFamilyHistoryForPatient({ condition_name: familyCondition });
          break;
        case 'surgical':
          if (!surgeryName) return;
          // Validate surgery date - no future dates
          if (surgeryDate) {
            const sd = new Date(surgeryDate);
            const now = new Date();
            if (sd > now) {
              // The controller will handle the error
              return;
            }
          }
          await surgicalCtrl.createSurgicalHistoryForPatient({
            surgery_name: surgeryName,
            surgery_date: surgeryDate || undefined,
          });
          break;
      }
      resetForm();
    } catch (err) {
      // Error handled by controller
    }
  }, [historyType, conditionName, diagnosisDate, allergyName, familyCondition, surgeryName, surgeryDate, medCtrl, allergyCtrl, familyCtrl, surgicalCtrl]);

  const currentCtrl = getCurrentController();

  const renderFormFields = () => {
    switch (historyType) {
      case 'medical':
        return (
          <>
            <TextInput
              label="Condition Name"
              value={conditionName}
              onChange={(e) => setConditionName(e.target.value)}
              placeholder="e.g., Hypertension, Diabetes"
              containerClassName="flex-1"
              required
            />
            <TextInput
              label="Diagnosis Date"
              type="date"
              value={diagnosisDate}
              onChange={(e) => setDiagnosisDate(e.target.value)}
              containerClassName="flex-1"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </>
        );
      case 'allergy':
        return (
          <TextInput
            label="Allergy Name"
            value={allergyName}
            onChange={(e) => setAllergyName(e.target.value)}
            placeholder="e.g., Peanuts, Penicillin"
            containerClassName="flex-1"
            required
          />
        );
      case 'family':
        return (
          <TextInput
            label="Family Condition"
            value={familyCondition}
            onChange={(e) => setFamilyCondition(e.target.value)}
            placeholder="e.g., Heart Disease, Cancer"
            containerClassName="flex-1"
            required
          />
        );
      case 'surgical':
        return (
          <>
            <TextInput
              label="Surgery Name"
              value={surgeryName}
              onChange={(e) => setSurgeryName(e.target.value)}
              placeholder="e.g., Appendectomy, Knee Surgery"
              containerClassName="flex-1"
              required
            />
            <TextInput
              label="Surgery Date (Optional)"
              type="date"
              value={surgeryDate}
              onChange={(e) => setSurgeryDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              containerClassName="flex-1"
            />
          </>
        );
    }
  };

  const getSubmitButtonLabel = () => {
    if (currentCtrl.loading) return 'Adding...';
    switch (historyType) {
      case 'medical': return 'Add Medical History';
      case 'allergy': return 'Add Allergy';
      case 'family': return 'Add Family History';
      case 'surgical': return 'Add Surgical History';
    }
  };

  const isFormValid = () => {
    switch (historyType) {
      case 'medical': return !!conditionName && !!diagnosisDate;
      case 'allergy': return !!allergyName;
      case 'family': return !!familyCondition;
      case 'surgical': return !!surgeryName;
      default: return false;
    }
  };

  return (
    <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-6">
      {/* Success/Error Messages */}
      {currentCtrl.success && (
        <Alert
          type="success"
          title="Success"
          message={currentCtrl.success}
          onClose={currentCtrl.clearMessages}
          className="mb-4"
        />
      )}
      {currentCtrl.error && (
        <Alert
          type="error"
          title="Error"
          message={currentCtrl.error}
          onClose={currentCtrl.clearMessages}
          className="mb-4"
        />
      )}

      <h2 className="text-xl font-bold text-gray-800 dark:text-[#e5e5e5] mb-6">
        Add New Health History
      </h2>

      <div className="space-y-4">
        {/* History Type Selector */}
        <Dropdown
          label="Select History Type"
          options={[
            { value: 'medical', label: 'Medical History' },
            { value: 'allergy', label: 'Allergy' },
            { value: 'family', label: 'Family History' },
            { value: 'surgical', label: 'Surgical History' },
          ]}
          value={historyType}
          onChange={(value) => {
            setHistoryType(value as HistoryType);
            resetForm();
            currentCtrl.clearMessages();
          }}
          containerClassName="max-w-md"
        />

        {/* Dynamic Form Fields */}
        <div className="flex flex-wrap gap-4">
          {renderFormFields()}
        </div>

        {/* Submit Button */}
        <div className="flex justify-start pt-2">
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={!isFormValid() || currentCtrl.loading}
          >
            {getSubmitButtonLabel()}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> This information will be added to your health records and can be viewed in the respective tabs above.
        </p>
      </div>
    </div>
  );
};

export default AddHistoryForm;
