import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePrescriptionController } from '../hooks/prescription';
import TextInput from './TextInput';
import Dropdown from './Dropdown';
import Button from './Button';
import Alert from './Alert';

const TIME_OPTIONS = ['Morning', 'Day', 'Evening', 'Night'] as const;
const MEAL_OPTIONS = ['Before meal', 'After meal', 'With meal'] as const;
const RECOMMENDED_ACTION_OPTIONS = ['Exercise', 'Rest', 'Hydration', 'Avoid driving'] as const;
const COMMON_DOSAGE_OPTIONS = [
  '250 mg',
  '500 mg',
  '650 mg',
  '1 tablet',
  '2 tablets',
  '5 ml',
  '10 ml',
  '1 capsule',
  '2 capsules',
] as const;

interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  initialPrescription?: {
    medicine_id: number;
    medicine_name: string;
    dosage: string;
    instruction: string;
  } | null;
  onSuccess?: (prescription: { medicine_id: number; medicine_name: string; dosage: string; instruction: string }) => void;
}

const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
  isOpen,
  onClose,
  appointmentId: _appointmentId,
  initialPrescription = null,
  onSuccess,
}) => {
  const { medicines, loading, error, loadMedicines, clearError } = usePrescriptionController();
  
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [selectedDosage, setSelectedDosage] = useState('');
  const [customDosage, setCustomDosage] = useState('');
  const [additionalInstruction, setAdditionalInstruction] = useState('');
  const [timesOfDay, setTimesOfDay] = useState<string[]>([]);
  const [mealRelation, setMealRelation] = useState<string>('');
  const [recommendedActions, setRecommendedActions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedicines();
      if (initialPrescription) {
        setSelectedMedicineId(String(initialPrescription.medicine_id));
        const initialDosage = (initialPrescription.dosage || '').trim();
        if (COMMON_DOSAGE_OPTIONS.includes(initialDosage as typeof COMMON_DOSAGE_OPTIONS[number])) {
          setSelectedDosage(initialDosage);
          setCustomDosage('');
        } else {
          setSelectedDosage('');
          setCustomDosage(initialDosage);
        }
        setAdditionalInstruction(initialPrescription.instruction || '');
        setTimesOfDay([]);
        setMealRelation('');
        setRecommendedActions([]);
      } else {
        // Reset form for create mode
        setSelectedMedicineId('');
        setSelectedDosage('');
        setCustomDosage('');
        setAdditionalInstruction('');
        setTimesOfDay([]);
        setMealRelation('');
        setRecommendedActions([]);
      }
      setFormError(null);
      clearError();
    }
  }, [isOpen, initialPrescription]);

  const toggleArrayValue = (value: string, values: string[], setValues: (next: string[]) => void) => {
    if (values.includes(value)) {
      setValues(values.filter((item) => item !== value));
      return;
    }

    setValues([...values, value]);
  };

  const buildStructuredInstruction = () => {
    const parts: string[] = [];

    if (timesOfDay.length > 0) {
      parts.push(`Times: ${timesOfDay.join(', ')}`);
    }

    if (mealRelation) {
      parts.push(`Meal: ${mealRelation}`);
    }

    if (recommendedActions.length > 0) {
      parts.push(`Recommended actions: ${recommendedActions.join(', ')}`);
    }

    if (additionalInstruction.trim()) {
      parts.push(`Notes: ${additionalInstruction.trim()}`);
    }

    return parts.join(' | ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    const instruction = buildStructuredInstruction();
    const trimmedDosage = (selectedDosage || customDosage || '').trim();

    if (!selectedMedicineId) {
      setFormError('Please select a medicine.');
      return;
    }

    if (!trimmedDosage) {
      setFormError('Dosage is required.');
      return;
    }

    if (!instruction) {
      setFormError('Add at least one instruction item (time, meal timing, recommended action, or notes).');
      return;
    }

    try {
      setSubmitting(true);
      
      // Find the medicine name from the list
      const medicine = medicines.find(m => m.medicineId === Number(selectedMedicineId));
      const medicineName = medicine?.name || '';
      
      // Reset form
      setSelectedMedicineId('');
      setSelectedDosage('');
      setCustomDosage('');
      setAdditionalInstruction('');
      setTimesOfDay([]);
      setMealRelation('');
      setRecommendedActions([]);
      
      if (onSuccess) {
        onSuccess({
          medicine_id: Number(selectedMedicineId),
          medicine_name: medicineName,
          dosage: trimmedDosage,
          instruction,
        });
      }
      
      onClose();
    } catch (err) {
      // Error is already set by the controller
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#2b2b2b] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialPrescription ? 'Edit Prescription' : 'Add Prescription'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <Alert
              message={error}
              type="error"
              onClose={clearError}
            />
          )}

          {formError && (
            <Alert
              message={formError}
              type="error"
              onClose={() => setFormError(null)}
            />
          )}

          {/* Medicine Selection */}
          <Dropdown
            label="Medicine"
            options={medicines.map((medicine) => ({
              value: String(medicine.medicineId),
              label: medicine.name,
            }))}
            value={selectedMedicineId}
            onChange={setSelectedMedicineId}
            placeholder="Select a medicine"
            searchable
            searchPlaceholder="Search medicines..."
            required
            disabled={loading}
          />

          {/* Dosage */}
          <Dropdown
            label="Common Dosage"
            options={COMMON_DOSAGE_OPTIONS.map((option) => ({ value: option, label: option }))}
            value={selectedDosage}
            onChange={setSelectedDosage}
            placeholder="Select a common dosage"
          />

          <TextInput
            label="Custom Dosage"
            type="text"
            value={customDosage}
            onChange={(e) => setCustomDosage(e.target.value)}
            placeholder="Use this only if dosage is not in the dropdown"
          />

          {/* Time of day checkboxes */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Time</p>
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map((time) => (
                <label key={time} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={timesOfDay.includes(time)}
                    onChange={() => toggleArrayValue(time, timesOfDay, setTimesOfDay)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {time}
                </label>
              ))}
            </div>
          </div>

          {/* Meal relation */}
          <Dropdown
            label="When"
            options={MEAL_OPTIONS.map((option) => ({ value: option, label: option }))}
            value={mealRelation}
            onChange={setMealRelation}
            placeholder="Select meal timing"
          />

          {/* Recommended actions checkboxes */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Recommended Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {RECOMMENDED_ACTION_OPTIONS.map((action) => (
                <label key={action} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={recommendedActions.includes(action)}
                    onChange={() => toggleArrayValue(action, recommendedActions, setRecommendedActions)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {action}
                </label>
              ))}
            </div>
          </div>

          {/* Instruction */}
          <TextInput
            label="Additional Notes"
            value={additionalInstruction}
            onChange={(e) => setAdditionalInstruction(e.target.value)}
            placeholder="Optional extra instructions for patient"
            multiline
            rows={3}
          />

          <div className="rounded border border-gray-200 dark:border-gray-700 p-3 text-sm">
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Instruction Preview</p>
            <p className="text-gray-600 dark:text-gray-400">
              {buildStructuredInstruction() || 'Add instruction details to generate preview.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={submitting}
              variant="outline"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedMedicineId || !(selectedDosage || customDosage.trim()) || !buildStructuredInstruction()}
              variant="primary"
              loading={submitting}
              fullWidth
            >
              {initialPrescription ? 'Update Prescription' : 'Add Prescription'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrescriptionModal;
