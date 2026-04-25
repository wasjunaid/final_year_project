import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import TextInput from '../ui/TextInput';
import Dropdown from '../ui/Dropdown';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { ROLES } from '../../constants/roles';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  role: yup.string().required('Role is required'),
});

const LoginForm = ({ onSubmit, error, loading }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: ROLES.INSURANCE_ADMIN,
    },
  });

  const selectedRole = watch('role');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <Alert type="error" message={error} />
      )}

      <TextInput
        {...register('email')}
        label="Email"
        type="email"
        error={errors.email?.message}
        autoComplete="email"
      />

      <TextInput
        {...register('password')}
        label="Password"
        type="password"
        error={errors.password?.message}
        autoComplete="current-password"
      />

      <Dropdown
        label="Role"
        value={selectedRole || ROLES.INSURANCE_ADMIN}
        onChange={(v) => setValue('role', v, { shouldValidate: true })}
        options={[
          { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
          { value: ROLES.INSURANCE_ADMIN, label: 'Insurance Admin' },
          { value: ROLES.INSURANCE_SUB_ADMIN, label: 'Insurance Sub Admin' },
        ]}
        error={errors.role?.message}
      />

      <input type="hidden" {...register('role')} />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;