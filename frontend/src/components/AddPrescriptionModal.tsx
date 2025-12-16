import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePrescriptionController } from '../hooks/prescription';
import TextInput from './TextInput';
import Dropdown from './Dropdown';
import Button from './Button';
import Alert from './Alert';

interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  onSuccess?: (prescription: { medicine_id: number; medicine_name: string; dosage: string; instruction: string }) => void;
}

const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
  isOpen,
  onClose,
  appointmentId: _appointmentId,
  onSuccess,
}) => {
  const { medicines, loading, error, loadMedicines, clearError } = usePrescriptionController();
  
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [dosage, setDosage] = useState('');
  const [instruction, setInstruction] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedicines();
      // Reset form
      setSelectedMedicineId('');
      setDosage('');
      setInstruction('');
      clearError();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicineId || !dosage || !instruction) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Find the medicine name from the list
      const medicine = medicines.find(m => m.medicineId === Number(selectedMedicineId));
      const medicineName = medicine?.name || '';
      
      // Reset form
      setSelectedMedicineId('');
      setDosage('');
      setInstruction('');
      
      if (onSuccess) {
        onSuccess({
          medicine_id: Number(selectedMedicineId),
          medicine_name: medicineName,
          dosage,
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
            Add Prescription
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
          <TextInput
            label="Dosage"
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 500 mg, 2 tablets"
            required
          />

          {/* Instruction */}
          <TextInput
            label="Instructions"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., Take twice daily after meals"
            multiline
            rows={3}
            required
          />

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
              disabled={submitting || !selectedMedicineId || !dosage || !instruction}
              variant="primary"
              loading={submitting}
              fullWidth
            >
              Add Prescription
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrescriptionModal;
