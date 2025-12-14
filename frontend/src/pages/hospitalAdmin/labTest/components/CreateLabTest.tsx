import React, { useState } from 'react';
import Button from '../../../../components/Button';
import TextInput from '../../../../components/TextInput';
import Alert from '../../../../components/Alert';
import { useLabTestController } from '../../../../hooks/labTest';

const CreateLabTest: React.FC = () => {
  const { createLabTest, loading, error, success, clearMessages } = useLabTestController();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createLabTest({ name: name.trim(), description: description.trim(), cost: Number(cost || 0) });
      setName(''); setDescription(''); setCost('0');
    } catch (err) {
      // controller shows error
    } finally {
      setSubmitting(false);
      setTimeout(() => clearMessages(), 2500);
    }
  };

  return (
    <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Create Lab Test</h2>

      {error && <Alert type="error" title="Error" message={error} onClose={clearMessages} />}
      {success && <Alert type="success" title="Success" message={success} onClose={clearMessages} />}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 justify-items-start">
        <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} minWidth='400px' />
        <TextInput label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} minWidth='400px' />
        <TextInput label="Cost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} maxWidth='100px' />

        <div className="flex items-center gap-2">
          <Button type="submit" loading={submitting || loading} variant="primary">Create</Button>
          <Button type="button" variant="outline" onClick={() => { setName(''); setDescription(''); setCost('0'); }}>Reset</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLabTest;