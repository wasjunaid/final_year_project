import { useState, useCallback, useMemo } from 'react';
import { appointmentApi } from '../services/appointmentApi';
import type { 
  Appointment, 
  CreateAppointmentRequest, 
  AppointmentRescheduleRequest, 
  ApproveAppointmentRequest
} from '../models/Appointment';
import StatusCodes from '../constants/StatusCodes';

export function useAppointment() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get all patient appointments
  const getAllPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentApi.getAllPatient();
      setAppointments(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setAppointments([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch patient appointments';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all doctor appointments
  const getAllDoctor = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentApi.getAllDoctor();
      setAppointments(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setAppointments([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch doctor appointments';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all hospital appointments
  const getAllHospital = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentApi.getAllHospital();
      setAppointments(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setAppointments([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch hospital appointments';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new appointment
  const createAppointment = useCallback(async (data: CreateAppointmentRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentApi.insert(data);
      setAppointments(prev => [response.data, ...prev]);
      setSuccess('Appointment created successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to create appointment';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve appointment
  const approveAppointment = useCallback(async (
    appointmentId: number,
    data: ApproveAppointmentRequest
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.approve(appointmentId, data);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, status: 'APPROVED' as const }
          : apt
      ));
      setSuccess('Appointment approved successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to approve appointment';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deny appointment
  const denyAppointment = useCallback(async (appointmentId: number) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.deny(appointmentId);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, status: 'DENIED' as const }
          : apt
      ));
      setSuccess('Appointment denied');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to deny appointment';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel appointment by patient
  const cancelByPatient = useCallback(async (appointmentId: number) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.cancelByPatient(appointmentId);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, status: 'CANCELLED' as const }
          : apt
      ));
      setSuccess('Appointment cancelled');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to cancel appointment';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reschedule by patient
  const rescheduleByPatient = useCallback(async (appointmentId: number, data: AppointmentRescheduleRequest) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.rescheduleByPatient(appointmentId, data);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, date: data.date, time: data.time, status: 'RESCHEDULED' as const }
          : apt
      ));
      setSuccess('Appointment rescheduled successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to reschedule appointment';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reschedule by hospital
  const rescheduleByHospital = useCallback(async (appointmentId: number, data: AppointmentRescheduleRequest) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.rescheduleByHospital(appointmentId, data);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, date: data.date, time: data.time, status: 'RESCHEDULED' as const }
          : apt
      ));
      setSuccess('Appointment rescheduled successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to reschedule appointment';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start appointment by doctor
  const startByDoctor = useCallback(async (appointmentId: number) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.startByDoctor(appointmentId);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, status: 'IN PROGRESS' as const }
          : apt
      ));
      setSuccess('Appointment started');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to start appointment';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set lab test required
  const setLabTestRequired = useCallback(async (appointmentId: number) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.setLabTestRequiredByDoctor(appointmentId);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, lab_test_required: true }
          : apt
      ));
      setSuccess('Lab test requirement set');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to set lab test requirement';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set prescription required
  const setPrescriptionRequired = useCallback(async (appointmentId: number) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.setLabPrescriptionRequiredByDoctor(appointmentId);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, prescription_required: true }
          : apt
      ));
      setSuccess('Prescription requirement set');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to set prescription requirement';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete by doctor
  const completeByDoctor = useCallback(async (appointmentId: number, doctorNote?: string) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.completeByDoctor(appointmentId, doctorNote);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, doctor_completed: true, status: 'COMPLETED' as const }
          : apt
      ));
      setSuccess('Appointment completed by doctor');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to complete appointment';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete lab test
  const completeLabTest = useCallback(async (appointmentId: number) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.completeLabTestByLabTechnician(appointmentId);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, lab_test_completed: true }
          : apt
      ));
      setSuccess('Lab test completed');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to complete lab test';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete prescription
  const completePrescription = useCallback(async (appointmentId: number) => {
    try {
      setLoading(true);
      setError('');
      await appointmentApi.completePrescriptionByLabTechnician(appointmentId);
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, prescription_completed: true }
          : apt
      ));
      setSuccess('Prescription completed');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to complete prescription';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    appointments,
    loading,
    error,
    success,
    clearMessages,
    getAllPatient,
    getAllDoctor,
    getAllHospital,
    createAppointment,
    approveAppointment,
    denyAppointment,
    cancelByPatient,
    rescheduleByPatient,
    rescheduleByHospital,
    startByDoctor,
    setLabTestRequired,
    setPrescriptionRequired,
    completeByDoctor,
    completeLabTest,
    completePrescription,
  }), [
    appointments,
    loading,
    error,
    success,
    clearMessages,
    getAllPatient,
    getAllDoctor,
    getAllHospital,
    createAppointment,
    approveAppointment,
    denyAppointment,
    cancelByPatient,
    rescheduleByPatient,
    rescheduleByHospital,
    startByDoctor,
    setLabTestRequired,
    setPrescriptionRequired,
    completeByDoctor,
    completeLabTest,
    completePrescription,
  ]);

  return returnValue;
}

export default useAppointment;