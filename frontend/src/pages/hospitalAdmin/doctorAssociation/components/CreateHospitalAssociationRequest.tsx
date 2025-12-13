import React, { useState } from 'react';
import TextInput from '../../../../components/TextInput';
import Button from '../../../../components/Button';
import Alert from '../../../../components/Alert';
import { useHospitalAssociationController } from '../../../../hooks/associationRequest';

export const CreateHospitalAssociationRequest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) {
      setError('Invalid email address');
      return;
    }

    setSending(true);
    try {
      // default role is doctor; change later to allow selecting role
      await insertRequest({ email: email.trim(), role: 'doctor' });
      setMessage(`Association request sent to ${email.trim()}`);
      setEmail('');
    } catch (e: any) {
      setError(e?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const { insertRequest } = useHospitalAssociationController();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Create New Request Association</h3>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} className="mb-3" />}
      {message && <Alert type="success" title="Success" message={message} onClose={() => setMessage(null)} className="mb-3" />}

      <div className="max-w-md">
        <TextInput label="Email" type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" />

        <div className="flex gap-2 mt-3">
          <Button onClick={handleSend} disabled={sending}>{sending ? 'Sending...' : 'Send Request'}</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateHospitalAssociationRequest;
