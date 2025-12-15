import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useMedicalHistoryController, useAllergyController, useFamilyHistoryController, useSurgicalHistoryController } from '../../hooks/patient';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import type { NavbarConfig } from '../../models/navbar/model';

const PatientHealthHistoryPage: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: "My Health",
  }), []);
  useNavbarController(navbarConfig);

  const medCtrl = useMedicalHistoryController();
  const allergyCtrl = useAllergyController();
  const familyCtrl = useFamilyHistoryController();
  const surgicalCtrl = useSurgicalHistoryController();

  // Input states
  const [conditionName, setConditionName] = useState('');
  const [diagnosisDate, setDiagnosisDate] = useState('');

  const [allergyName, setAllergyName] = useState('');

  const [familyCondition, setFamilyCondition] = useState('');

  const [surgeryName, setSurgeryName] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');

  // Load patient data on mount
  useEffect(() => {
    medCtrl.fetchMedicalHistoryForPatient().catch(() => {});
    allergyCtrl.fetchAllergiesForPatient().catch(() => {});
    familyCtrl.fetchFamilyHistoryForPatient().catch(() => {});
    surgicalCtrl.fetchSurgicalHistoryForPatient().catch(() => {});
  }, []);

  // Handlers
  const handleAddMedical = useCallback(async () => {
    if (!conditionName) return;
    if (!diagnosisDate) {
      medCtrl.clearMessages();
      // show error via controller by throwing? we'll set an error message via controller
      try { throw new Error('Diagnosis date is required'); } catch (err) { medCtrl.clearMessages(); }
      return;
    }

    // validate date not in future
    const sd = new Date(diagnosisDate);
    const now = new Date();
    sd.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    if (isNaN(sd.getTime()) || sd.getTime() > now.getTime()) {
      medCtrl.clearMessages();
      return;
    }

    try {
      await medCtrl.createMedicalHistoryForPatient({ condition_name: conditionName, diagnosis_date: diagnosisDate });
      setConditionName('');
      setDiagnosisDate('');
    } catch (err) {
      // handled by controller
    }
  }, [conditionName, diagnosisDate, medCtrl]);

  const handleAddAllergy = useCallback(async () => {
    if (!allergyName) return;
    try {
      await allergyCtrl.createAllergyForPatient({ allergy_name: allergyName });
      setAllergyName('');
    } catch (err) {}
  }, [allergyName, allergyCtrl]);

  const handleAddFamily = useCallback(async () => {
    if (!familyCondition) return;
    try {
      await familyCtrl.createFamilyHistoryForPatient({ condition_name: familyCondition });
      setFamilyCondition('');
    } catch (err) {}
  }, [familyCondition, familyCtrl]);

  const handleAddSurgery = useCallback(async () => {
    if (!surgeryName) return;
    // basic date validation: no future dates
    if (surgeryDate) {
      const sd = new Date(surgeryDate);
      const now = new Date();
      if (sd > now) {
        // Avoid calling backend with future dates
        surgicalCtrl.clearMessages();
        return;
      }
    }

    try {
      await surgicalCtrl.createSurgicalHistoryForPatient({ surgery_name: surgeryName, surgery_date: surgeryDate || undefined });
      setSurgeryName('');
      setSurgeryDate('');
    } catch (err) {}
  }, [surgeryName, surgeryDate, surgicalCtrl]);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {[medCtrl, allergyCtrl, familyCtrl, surgicalCtrl].map((c, idx) => (
        <div key={idx}>
          {c.success && <Alert type="success" title={c.success} message={undefined as any} onClose={c.clearMessages} />}
          {c.error && <Alert type="error" title={c.error} message={undefined as any} onClose={c.clearMessages} />}
        </div>
      ))}

      {/* Medical History */}
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border p-6">
        <h3 className="text-lg font-bold mb-3">Medical History</h3>
        <div className="flex gap-2 flex-wrap">
          <TextInput label="Condition" value={conditionName} onChange={(e) => setConditionName(e.target.value)} />
          <TextInput label="Diagnosis Date" type="date" value={diagnosisDate} onChange={(e) => setDiagnosisDate(e.target.value)} />
          <Button onClick={handleAddMedical} variant="primary">Add</Button>
        </div>

        <div className="mt-4 space-y-2">
          {medCtrl.medicalHistory.map(item => (
            <div key={item.patientMedicalHistoryId} className="p-2 border rounded">{item.conditionName}{item.diagnosisDate ? ` — ${item.diagnosisDate}` : ''}</div>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border p-6">
        <h3 className="text-lg font-bold mb-3">Allergies</h3>
        <div className="flex gap-2">
          <TextInput label="Allergy" value={allergyName} onChange={(e) => setAllergyName(e.target.value)} />
          <Button onClick={handleAddAllergy} variant="primary">Add</Button>
        </div>

        <div className="mt-4 space-y-2">
          {allergyCtrl.allergies.map(item => (
            <div key={item.patientAllergyId} className="p-2 border rounded">{item.allergyName}</div>
          ))}
        </div>
      </div>

      {/* Family History */}
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border p-6">
        <h3 className="text-lg font-bold mb-3">Family History</h3>
        <div className="flex gap-2">
          <TextInput label="Condition" value={familyCondition} onChange={(e) => setFamilyCondition(e.target.value)} />
          <Button onClick={handleAddFamily} variant="primary">Add</Button>
        </div>

        <div className="mt-4 space-y-2">
          {familyCtrl.familyHistory.map(item => (
            <div key={item.patientFamilyHistoryId} className="p-2 border rounded">{item.conditionName}</div>
          ))}
        </div>
      </div>

      {/* Surgical History */}
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border p-6">
        <h3 className="text-lg font-bold mb-3">Surgical History</h3>
        <div className="flex gap-2 flex-wrap">
          <TextInput label="Surgery" value={surgeryName} onChange={(e) => setSurgeryName(e.target.value)} />
          <TextInput label="Surgery Date" type="date" value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} />
          <Button onClick={handleAddSurgery} variant="primary">Add</Button>
        </div>

        <div className="mt-4 space-y-2">
          {surgicalCtrl.surgicalHistory.map(item => (
            <div key={item.patientSurgicalHistoryId} className="p-2 border rounded">{item.surgeryName}{item.surgeryDate ? ` — ${item.surgeryDate}` : ''}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientHealthHistoryPage;
