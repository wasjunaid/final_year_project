import { useState, useCallback, useEffect } from 'react';
import type { AssociatedDoctorModel } from '../../models/associatedStaff/doctors/model';

// Factory to create doctor controller with dependency injection
export const createUseDoctorController = ({ doctorRepository }: { doctorRepository: any }) => {
  return () => {
    const [doctors, setDoctors] = useState<AssociatedDoctorModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const fetchForAppointmentBooking = useCallback(async (): Promise<AssociatedDoctorModel[]> => {
      try {
        setLoading(true);
        setError('');
        const data = await doctorRepository.fetchForAppointmentBooking();
        setDoctors(data || []);
        return data || [];
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch doctors');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [doctorRepository]);

    // Auto-fetch on mount so consumers can use doctors immediately
    useEffect(() => {
      fetchForAppointmentBooking().catch(() => {});
    }, [fetchForAppointmentBooking]);

    return {
      doctors,
      loading,
      error,
      fetchForAppointmentBooking,
    };
  };
};

export type DoctorController = ReturnType<ReturnType<typeof createUseDoctorController>>;
