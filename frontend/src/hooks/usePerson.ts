import { useState, useCallback, useMemo } from 'react';
import { personApi } from '../services/personApi';
import type { 
  Person, 
  UpdatePersonRequest
} from '../models/Person';
import StatusCodes from '../constants/StatusCodes';

export function usePerson() {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get current person profile
  const getPerson = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await personApi.get();
      setPerson(response.data);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setPerson(null);
        return null;
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch person profile';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update person profile
  const updatePerson = useCallback(async (data: UpdatePersonRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await personApi.update(data);
      setPerson(response.data);
      setSuccess('Profile updated successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update profile';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete person account
  const deletePerson = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      await personApi.delete();
      setPerson(null);
      setSuccess('Account deleted successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to delete account';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    person,
    loading,
    error,
    success,
    clearMessages,
    getPerson,
    updatePerson,
    deletePerson,
  }), [
    person,
    loading,
    error,
    success,
    clearMessages,
    getPerson,
    updatePerson,
    deletePerson,
  ]);

  return returnValue;
}

export default usePerson;