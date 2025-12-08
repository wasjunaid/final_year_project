import { useState, useEffect } from 'react';
import type { HospitalStaffModel } from '../../models/hospitalStaff/model';
import type { CreateHospitalStaffPayload } from '../../models/hospitalStaff/payload';

// Factory to create hospital staff controller with DI for repository
export const createUseHospitalStaffController = ({ hospitalStaffRepository }: { hospitalStaffRepository: any }) => {
  return () => {
    const [hospitalStaff, setHospitalStaff] = useState<HospitalStaffModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchHospitalStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hospitalStaffRepository.getAllHospitalStaff();
        setHospitalStaff(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hospital staff');
      } finally {
        setLoading(false);
      }
    };

    const createHospitalStaff = async (payload: CreateHospitalStaffPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const newStaff = await hospitalStaffRepository.createHospitalStaff(payload);
        setHospitalStaff((prev) => [...prev, newStaff]);
        setSuccess('Hospital staff created successfully!');
        return newStaff;
      } catch (err: any) {
        setError(err.message || 'Failed to create hospital staff');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const deleteHospitalStaff = async (hospitalStaffId: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await hospitalStaffRepository.deleteHospitalStaff(hospitalStaffId);
        setHospitalStaff((prev) => prev.filter((s) => s.hospital_staff_id !== hospitalStaffId));
        setSuccess('Hospital staff deleted successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to delete hospital staff');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch on mount
    useEffect(() => {
      fetchHospitalStaff();
    }, []);

    const clearMessages = () => {
      setError(null);
      setSuccess(null);
    };

    return {
      hospitalStaff,
      loading,
      error,
      success,

      // Setters for error and success to allow manual setting if needed (not recommended, in this case i needed it to handle missing hospital ID)
      setError,
      setSuccess,

      fetchHospitalStaff,
      createHospitalStaff,
      deleteHospitalStaff,
      clearMessages,
    };
  };
};
