import React, { useState } from 'react';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useDoctorAccessController } from '../../hooks/accessRequest/useDoctorAccessRequestController.instance';
import type { CreateAccessRequestPayload } from '../../models/accessRequest/payload';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';

const CreateAccessRequestPage: React.FC = () => {
  useNavbarController();

  const { createRequest, error, success, setSuccess } = useDoctorAccessController();

  const [patientEmail, setPatientEmail] = useState('');
  const [documentId, setDocumentId] = useState<string>('');

  const handleCreate = async () => {
    try {
      const payload: CreateAccessRequestPayload = {
        requester_id: 0,
        patient_email: patientEmail,
        document_id: documentId ? Number(documentId) : undefined,
      } as any;
      await createRequest(payload as any);
      setPatientEmail('');
      setDocumentId('');
      setSuccess && setSuccess('Access request created');
    } catch (err) {
      // handled in hook
    }
  };

  return (
    <div className='p-4'>
      {error && <Alert type="error" title="Error" message={error} className="mb-3" />}
      {success && <Alert type="success" title="Success" message={success} className="mb-3" />}

      <div className="flex flex-col flex-wrap items-start mb-4 gap-3">
        <TextInput 
          label='Email' 
          value={patientEmail} 
          onChange={(e) => setPatientEmail(e.target.value)}
          minWidth="300px"
          placeholder="Patient email" 
        />
        {/* <TextInput value={documentId} onChange={(e) => setDocumentId(e.target.value)} placeholder="Document ID (optional)" /> */}
        
        <Button onClick={handleCreate} variant='primary'>Create Request</Button>
      </div>
    </div>
  );
};

export default CreateAccessRequestPage;
