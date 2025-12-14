import React, { useState } from 'react';
import Button from '../../../../components/Button';
import TextInput from '../../../../components/TextInput';
import type { LabTest } from '../../../../models/labTest/model';
import { useLabTestController } from '../../../../hooks/labTest';

type Props = {
  labTest: LabTest | null;
  onCancel: () => void;
  onUpdated?: (updated: LabTest) => void;
};

const EditLabTest: React.FC<Props> = ({ labTest, onCancel, onUpdated }) => {
  const { updateLabTest, loading, error, success, clearMessages } = useLabTestController();
  const [name, setName] = useState(labTest?.name ?? '');
  const [description, setDescription] = useState(labTest?.description ?? '');
  const [cost, setCost] = useState(String(labTest?.cost ?? '0'));
  const [saving, setSaving] = useState(false);

  if (!labTest) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateLabTest(labTest.labTestId, { name: name.trim(), description: description.trim(), cost: Number(cost || 0) });
      onUpdated?.(updated);
      onCancel();
    } catch (err) {
      // errors handled by controller
    } finally {
      setSaving(false);
      setTimeout(() => clearMessages(), 2500);
    }
  };

  return (
    <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Lab Test</h2>

      {error && <div className="mb-3"><div className="text-red-600">{error}</div></div>}
      {success && <div className="mb-3"><div className="text-green-600">{success}</div></div>}

      <div className="grid grid-cols-1 gap-3 justify-items-start">
        <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} minWidth='400px' />
        <TextInput label="Description" value={description ?? ''} onChange={(e) => setDescription(e.target.value)} multiline rows={3} minWidth='400px' />
        <TextInput label="Cost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} maxWidth='100px' />

        <div className="flex items-center gap-2 mt-3">
          <Button variant="primary" onClick={handleSave} loading={saving || loading}>Save</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default EditLabTest;