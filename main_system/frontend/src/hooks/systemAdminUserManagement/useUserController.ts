import { useState, useEffect } from 'react';
import type { SystemSubAdminModel, HospitalAdminModel } from '../../models/systemAdminUserManagement/model';
import type { CreateSystemSubAdminPayload, CreateHospitalAdminPayload, UserListFiltersPayload } from '../../models/systemAdminUserManagement/payload';

// Factory to create system admin user management controller hook with DI for repository
export const createUseSystemAdminUserManagementController = ({ systemAdminUserManagementRepository }: { systemAdminUserManagementRepository: any }) => {
  return () => {
    const [systemSubAdmins, setSystemSubAdmins] = useState<SystemSubAdminModel[]>([]);
    const [hospitalAdmins, setHospitalAdmins] = useState<HospitalAdminModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch system sub admins
    const fetchSystemSubAdmins = async (filters?: UserListFiltersPayload) => {
      try {
        setLoading(true);
        setError(null);
        const data = await systemAdminUserManagementRepository.getAllSystemSubAdmins(filters);
        setSystemSubAdmins(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch system sub admins');
      } finally {
        setLoading(false);
      }
    };

    // Fetch hospital admins
    const fetchHospitalAdmins = async (filters?: UserListFiltersPayload) => {
      try {
        setLoading(true);
        setError(null);
        const data = await systemAdminUserManagementRepository.getAllHospitalAdmins(filters);
        setHospitalAdmins(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hospital admins');
      } finally {
        setLoading(false);
      }
    };

    // Create system sub admin
    const createSystemSubAdmin = async (payload: CreateSystemSubAdminPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const newUser = await systemAdminUserManagementRepository.createSystemSubAdmin(payload);
        setSystemSubAdmins((prev: SystemSubAdminModel[]) => [...prev, newUser]);
        setSuccess('System sub admin created successfully! Password has been sent to their email.');
        
        return newUser;
      } catch (err: any) {
        setError(err.message || 'Failed to create system sub admin');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Create hospital admin
    const createHospitalAdmin = async (payload: CreateHospitalAdminPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const newUser = await systemAdminUserManagementRepository.createHospitalAdmin(payload);
        setHospitalAdmins((prev: HospitalAdminModel[]) => [...prev, newUser]);
        setSuccess('Hospital admin created successfully! Password has been sent to their email.');
        
        return newUser;
      } catch (err: any) {
        setError(err.message || 'Failed to create hospital admin');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Delete system sub admin
    const deleteSystemSubAdmin = async (systemAdminId: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await systemAdminUserManagementRepository.deleteSystemSubAdmin(systemAdminId);
        setSystemSubAdmins((prev: SystemSubAdminModel[]) => prev.filter((user) => user.system_admin_id !== systemAdminId));
        setSuccess('System sub admin deleted successfully');
      } catch (err: any) {
        setError(err.message || 'Failed to delete system sub admin');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Activate/deactivate system sub admin
    const updateSystemSubAdminStatus = async (systemAdminId: number, isActive: boolean, filters?: UserListFiltersPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await systemAdminUserManagementRepository.updateSystemSubAdminStatus(systemAdminId, isActive);
        const refreshed = await systemAdminUserManagementRepository.getAllSystemSubAdmins(filters);
        setSystemSubAdmins(refreshed);
        setSuccess(`System sub admin ${isActive ? 'activated' : 'deactivated'} successfully`);
      } catch (err: any) {
        setError(err.message || 'Failed to update system sub admin status');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Delete hospital admin
    const deleteHospitalAdmin = async (hospitalStaffId: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await systemAdminUserManagementRepository.deleteHospitalAdmin(hospitalStaffId);
        setHospitalAdmins((prev : HospitalAdminModel[]) => prev.filter((user) => user.hospital_staff_id !== hospitalStaffId));
        setSuccess('Hospital admin deleted successfully');
      } catch (err: any) {
        setError(err.message || 'Failed to delete hospital admin');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Activate/deactivate hospital admin
    const updateHospitalAdminStatus = async (hospitalStaffId: number, isActive: boolean, filters?: UserListFiltersPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await systemAdminUserManagementRepository.updateHospitalAdminStatus(hospitalStaffId, isActive);
        const refreshed = await systemAdminUserManagementRepository.getAllHospitalAdmins(filters);
        setHospitalAdmins(refreshed);
        setSuccess(`Hospital admin ${isActive ? 'activated' : 'deactivated'} successfully`);
      } catch (err: any) {
        setError(err.message || 'Failed to update hospital admin status');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Clear messages
    const clearMessages = () => {
      setError(null);
      setSuccess(null);
    };

    // Auto-fetch on mount
    useEffect(() => {
      fetchSystemSubAdmins();
      fetchHospitalAdmins();
    }, []);

    return {
      systemSubAdmins,
      hospitalAdmins,
      loading,
      error,
      success,
      fetchSystemSubAdmins,
      fetchHospitalAdmins,
      createSystemSubAdmin,
      createHospitalAdmin,
      deleteSystemSubAdmin,
      updateSystemSubAdminStatus,
      deleteHospitalAdmin,
      updateHospitalAdminStatus,
      clearMessages,
    };
  };
};
