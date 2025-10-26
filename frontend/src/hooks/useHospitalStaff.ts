import { useState, useCallback, useMemo } from 'react';
import { hospitalStaffApi } from '../services/hospitalStaffApi';
import type { 
  HospitalStaff, 
  CreateHospitalStaffRequest
} from '../models/HospitalStaff';
import StatusCodes from '../constants/StatusCodes';

export function useHospitalStaff() {
  const [staff, setStaff] = useState<HospitalStaff[]>([]);
  const [admins, setAdmins] = useState<HospitalStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get admins for super admin
  const getAdminsForSuperAdmin = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalStaffApi.getAdminsForSuperAdmin();
      setAdmins(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setAdmins([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch hospital admins';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get hospital staff
  const getStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalStaffApi.get();
      setStaff(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setStaff([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch hospital staff';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all hospital staff
  const getAllStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalStaffApi.getAll();
      setStaff(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setStaff([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch all hospital staff';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new hospital staff
  const createStaff = useCallback(async (data: CreateHospitalStaffRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalStaffApi.insert(data);
      setStaff(prev => [response.data, ...prev]);
      
      // If it's an admin, also add to admins list
      if (data.role.toLowerCase().includes('admin')) {
        setAdmins(prev => [response.data, ...prev]);
      }
      
      setSuccess('Hospital staff created successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to create hospital staff';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete hospital staff
  const deleteStaff = useCallback(async (staffId: number) => {
    try {
      setLoading(true);
      setError('');
      await hospitalStaffApi.delete(staffId);
      
      setStaff(prev => prev.filter(member => 
        member.hospital_staff_id !== staffId
      ));
      
      setAdmins(prev => prev.filter(member => 
        member.hospital_staff_id !== staffId
      ));
      
      setSuccess('Hospital staff deleted successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to delete hospital staff';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    staff,
    admins,
    loading,
    error,
    success,
    clearMessages,
    getAdminsForSuperAdmin,
    getStaff,
    getAllStaff,
    createStaff,
    deleteStaff,
  }), [
    staff,
    admins,
    loading,
    error,
    success,
    clearMessages,
    getAdminsForSuperAdmin,
    getStaff,
    getAllStaff,
    createStaff,
    deleteStaff,
  ]);

  return returnValue;
}

export default useHospitalStaff;