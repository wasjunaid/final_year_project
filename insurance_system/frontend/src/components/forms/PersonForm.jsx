import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import TextInput from '../ui/TextInput';
import Button from '../ui/Button';
import { validateCNIC } from '../../utils/validation';

const schema = yup.object().shape({
  cnic: yup
    .string()
    .required('CNIC is required')
    .test('valid-cnic', 'Invalid CNIC format (13 digits)', validateCNIC),
  first_name: yup.string().required('First name is required').max(255),
  last_name: yup.string().required('Last name is required').max(255),
});

const PersonForm = ({ open, onClose, onSubmit, loading }) => {
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Person</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <TextInput
              {...register('cnic')}
              label="CNIC (13 digits)"
              error={errors.cnic?.message}
              placeholder="XXXXXXXXXXXXX or XXXXX-XXXXXXX-X"
            />
          </div>
          <TextInput
            {...register('first_name')}
            label="First Name"
            error={errors.first_name?.message}
          />
          <TextInput
            {...register('last_name')}
            label="Last Name"
            error={errors.last_name?.message}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleFormSubmit)}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Person'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonForm;