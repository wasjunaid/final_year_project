import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';

const schema = yup.object().shape({
  insurance_number: yup.string().required('Insurance number is required'),
  claim_amount: yup.number().required('Claim amount is required').positive(),
  claim_description: yup.string().required('Description is required'),
});

const ClaimForm = ({ open, onClose, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#2d2d2d] p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Submit New Claim</h3>
        <div className="grid grid-cols-1 gap-3">
          <TextInput
            {...register('insurance_number')}
            label="Insurance Number"
            error={errors.insurance_number?.message}
          />
          <TextInput
            {...register('claim_amount')}
            type="number"
            label="Claim Amount"
            error={errors.claim_amount?.message}
          />
          <TextInput
            {...register('claim_description')}
            label="Description"
            multiline
            rows={4}
            error={errors.claim_description?.message}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(handleFormSubmit)} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClaimForm;
