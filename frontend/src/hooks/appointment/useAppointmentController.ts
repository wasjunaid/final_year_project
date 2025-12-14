import { useState } from 'react';
import type { AppointmentModel } from '../../models/appointment/model';
import type { 
  CreateAppointmentPayload, 
  PatientRescheduleAppointmentPayload, 
  HospitalRescheduleAppointmentPayload, 
  CompleteDoctorPayload
} from '../../models/appointment/payload';

// Factory to create appointment controller with DI for repository
export const createUseAppointmentController = ({ appointmentRepository }: { appointmentRepository: any }) => {
  return () => {
    const [patientAppointments, setPatientAppointments] = useState<AppointmentModel[]>([]);
    const [doctorAppointments, setDoctorAppointments] = useState<AppointmentModel[]>([]);
    const [hospitalAppointments, setHospitalAppointments] = useState<AppointmentModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchForPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await appointmentRepository.fetchForPatient();
        setPatientAppointments(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch appointments for patient');
      } finally {
        setLoading(false);
      }
    };

    const fetchForDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await appointmentRepository.fetchForDoctor();
        setDoctorAppointments(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch appointments for doctor');
      } finally {
        setLoading(false);
      }
    };

    const fetchForHospital = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await appointmentRepository.fetchForHospital();
        setHospitalAppointments(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch appointments for hospital');
      } finally {
        setLoading(false);
      }
    };

    const createAppointment = async (payload: CreateAppointmentPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const created = await appointmentRepository.create(payload);
        setPatientAppointments((prev) => [...prev, created]);
        setSuccess('Appointment created successfully');
        return created;
      } catch (err: any) {
        setError(err?.message || 'Failed to create appointment');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const updateAcrossLists = (updated: AppointmentModel) => {
      setPatientAppointments((prev) => prev.map((a) => (a.appointmentId === updated.appointmentId ? updated : a)));
      setDoctorAppointments((prev) => prev.map((a) => (a.appointmentId === updated.appointmentId ? updated : a)));
      setHospitalAppointments((prev) => prev.map((a) => (a.appointmentId === updated.appointmentId ? updated : a)));
    };

    const removeFromAll = (appointmentId: number) => {
      setPatientAppointments((prev) => prev.filter((a) => a.appointmentId !== appointmentId));
      setDoctorAppointments((prev) => prev.filter((a) => a.appointmentId !== appointmentId));
      setHospitalAppointments((prev) => prev.filter((a) => a.appointmentId !== appointmentId));
    };

    const approve = async (appointmentId: number, payload?: any) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await appointmentRepository.approve(appointmentId, payload);
        updateAcrossLists(updated);
        return updated;
      } catch (err: any) {
        setError(err?.message || 'Failed to approve appointment');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const deny = async (appointmentId: number) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await appointmentRepository.deny(appointmentId);
        updateAcrossLists(updated);
        return updated;
      } catch (err: any) {
        setError(err?.message || 'Failed to deny appointment');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const cancel = async (appointmentId: number) => {
      try {
        setLoading(true);
        setError(null);
        await appointmentRepository.cancel(appointmentId);
        removeFromAll(appointmentId);
        setSuccess('Appointment cancelled');
      } catch (err: any) {
        setError(err?.message || 'Failed to cancel appointment');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const rescheduleForPatient = async (appointmentId: number, payload: PatientRescheduleAppointmentPayload) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await appointmentRepository.rescheduleForPatient(appointmentId, payload);
        updateAcrossLists(updated);
        return updated;
      } catch (err: any) {
        setError(err?.message || 'Failed to reschedule appointment');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const rescheduleForHospital = async (appointmentId: number, payload: HospitalRescheduleAppointmentPayload) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await appointmentRepository.rescheduleForHospital(appointmentId, payload);
        updateAcrossLists(updated);
        return updated;
      } catch (err: any) {
        setError(err?.message || 'Failed to reschedule appointment');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const start = async (appointmentId: number) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await appointmentRepository.start(appointmentId);
        updateAcrossLists(updated);
        return updated;
      } catch (err: any) {
        setError(err?.message || 'Failed to start appointment');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const completeDoctor = async (appointmentId: number, payload: CompleteDoctorPayload) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await appointmentRepository.completeDoctor(appointmentId, payload);
        updateAcrossLists(updated);
        return updated;
      } catch (err: any) {
        setError(err?.message || 'Failed to complete appointment (doctor)');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const completeLabTests = async (appointmentId: number) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await appointmentRepository.completeLabTests(appointmentId);
        updateAcrossLists(updated);
        return updated;
      } catch (err: any) {
        setError(err?.message || 'Failed to complete lab tests');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const clearMessages = () => {
      setError(null);
      setSuccess(null);
    };

    return {
      patientAppointments,
      doctorAppointments,
      hospitalAppointments,
      // backwards-compatible aggregated list
      get appointments() {
        const map = new Map<number, AppointmentModel>();
        [...patientAppointments, ...doctorAppointments, ...hospitalAppointments].forEach((a) => {
          map.set(a.appointmentId, a);
        });
        return Array.from(map.values());
      },
      loading,
      error,
      success,

      fetchForPatient,
      fetchForDoctor,
      fetchForHospital,

      createAppointment,
      approve,
      deny,
      cancel,
      rescheduleForPatient,
      rescheduleForHospital,
      start,
      completeDoctor,
      completeLabTests,

      clearMessages,
    };
  };
};
