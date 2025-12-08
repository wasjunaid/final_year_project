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

  return { doctors, medicalCoders, loading, error, reload: load } as const;
}

export default useAssociatedStaffController;
