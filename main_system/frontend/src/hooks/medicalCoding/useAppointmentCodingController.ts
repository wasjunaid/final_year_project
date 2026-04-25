import { useState, useCallback } from 'react';
import { appointmentICDRepository } from '../../repositories/medicalCoding/appointmentICDRepository';
import { appointmentCPTRepository } from '../../repositories/medicalCoding/appointmentCPTRepository';
import type { AppointmentICDModel, AppointmentCPTModel } from '../../models/medicalCoding/model';

export const useAppointmentCodingController = () => {
  const [icdCodes, setIcdCodes] = useState<AppointmentICDModel[]>([]);
  const [cptCodes, setCptCodes] = useState<AppointmentCPTModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCodesForAppointment = useCallback(async (appointmentId: number) => {
    setLoading(true);
    setError(null);
    try {
      const [icd, cpt] = await Promise.all([
        appointmentICDRepository.fetchForAppointment(appointmentId),
        appointmentCPTRepository.fetchForAppointment(appointmentId),
      ]);
      setIcdCodes(icd);
      setCptCodes(cpt);
      return { icd, cpt };
    } catch (err: any) {
      // Provide friendly messages for common HTTP errors (e.g., 404 = not found / not generated)
      const status = err?.response?.status;
      if (status === 404) {
        setError('Codes not available for this appointment.');
      } else if (status === 204) {
        setError('No codes were generated for this appointment.');
      } else {
        setError(err?.message || 'Failed to fetch appointment codes');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setIcdCodes([]);
    setCptCodes([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    icdCodes,
    cptCodes,
    loading,
    error,
    fetchCodesForAppointment,
    clear,
  };
};

export default useAppointmentCodingController;
