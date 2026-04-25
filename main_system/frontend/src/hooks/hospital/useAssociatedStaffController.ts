import { useEffect, useState } from 'react';
import associatedStaffRepository from '../../repositories/hospital/associatedStaffRepository';
import type { AssociatedDoctorModel, AssociatedMedicalCoderModel } from '../../models/associatedStaff/model';

export function useAssociatedStaffController() {
  const [doctors, setDoctors] = useState<AssociatedDoctorModel[]>([]);
  const [medicalCoders, setMedicalCoders] = useState<AssociatedMedicalCoderModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { doctors: d, medicalCoders: m } = await associatedStaffRepository.fetchAssociatedStaff();
      setDoctors(d);
      setMedicalCoders(m);
    } catch (err: any) {
      setError(err?.message || 'Failed to load associated staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeDoctorHospitalAssociation = async (
    doctorId: number,
    payload?: { reassignment_mode?: 'manual' | 'automatic'; reassigned_doctor_id?: number }
  ) => {
    setLoading(true);
    setError(null);
    try {
      await associatedStaffRepository.removeDoctorHospitalAssociation(doctorId, payload);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove doctor association');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { doctors, medicalCoders, loading, error, reload: load, removeDoctorHospitalAssociation } as const;
}

export default useAssociatedStaffController;
