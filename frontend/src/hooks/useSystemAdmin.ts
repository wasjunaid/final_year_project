import { useState, useCallback, useMemo } from 'react';
import { systemAdminApi } from '../services/systemAdminApi';
import type { 
  SystemAdmin, 
  CreateSystemAdminRequest
} from '../models/SystemAdmin';
import StatusCodes from '../constants/StatusCodes';

export function useSystemAdmin() {
  const [systemAdmins, setSystemAdmins] = useState<SystemAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get all system admins
  const getAllSystemAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await systemAdminApi.getAll();
      setSystemAdmins(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setSystemAdmins([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch system admins';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new system admin
  const createSystemAdmin = useCallback(async (data: CreateSystemAdminRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await systemAdminApi.insert(data);
      setSystemAdmins(prev => [response.data, ...prev]);
      setSuccess('System admin created successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to create system admin';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete system admin
  const deleteSystemAdmin = useCallback(async (systemAdminId: number) => {
    try {
      setLoading(true);
      setError('');
      await systemAdminApi.delete(systemAdminId);
      setSystemAdmins(prev => prev.filter(admin => 
        admin.system_admin_id !== systemAdminId
      ));
      setSuccess('System admin deleted successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to delete system admin';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    systemAdmins,
    loading,
    error,
    success,
    clearMessages,
    getAllSystemAdmins,
    createSystemAdmin,
    deleteSystemAdmin,
  }), [
    systemAdmins,
    loading,
    error,
    success,
    clearMessages,
    getAllSystemAdmins,
    createSystemAdmin,
    deleteSystemAdmin,
  ]);

  return returnValue;
}

export default useSystemAdmin;