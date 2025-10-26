import { useState, useCallback, useMemo } from 'react';
import { doctorApi } from '../services/doctorApi';
import type { 
  Doctor, 
  UpdateDoctorRequest,
  UpdateDoctorStatusRequest,
  UpdateDoctorHospitalRequest
} from '../models/Doctor';
import StatusCodes from '../constants/StatusCodes';

export function useDoctor() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get current doctor profile
  const getDoctor = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorApi.get();
      setDoctor(response.data);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setDoctor(null);
        return null;
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch doctor profile';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get doctors for appointment booking
  const getDoctorsForAppointmentBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorApi.getDoctorsForAppointmentBooking();
      setDoctors(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setDoctors([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch doctors';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get hospital associated doctors
  const getHospitalAssociatedDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorApi.getHospitalassociatedDoctors();
      setDoctors(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setDoctors([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch hospital doctors';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update doctor profile
  const updateDoctor = useCallback(async (data: UpdateDoctorRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorApi.update(data);
      setDoctor(response.data);
      setSuccess('Doctor profile updated successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update doctor profile';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update doctor status
  const updateDoctorStatus = useCallback(async (doctorId: number, data: UpdateDoctorStatusRequest) => {
    try {
      setLoading(true);
      setError('');
      await doctorApi.updateStatus(doctorId, data);
      
      // Update doctor in current profile if it matches
      if (doctor && doctor.doctor_id === doctorId) {
        setDoctor(prev => prev ? { ...prev, doctor_status: data.status } : null);
      }
      
      // Update doctor in doctors list
      setDoctors(prev => prev.map(doc => 
        doc.doctor_id === doctorId 
          ? { ...doc, doctor_status: data.status }
          : doc
      ));
      
      setSuccess(`Doctor status updated to ${data.status}`);
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update doctor status';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [doctor]);

  // Update hospital by doctor
  const updateHospitalByDoctor = useCallback(async (data: UpdateDoctorHospitalRequest) => {
    try {
      setLoading(true);
      setError('');
      await doctorApi.updateHospitalByDoctor(data);
      
      // Update doctor in current profile
      if (doctor) {
        setDoctor(prev => prev ? { ...prev, hospital_id: data.hospital_id } : null);
      }
      
      setSuccess('Hospital association updated successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update hospital association';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [doctor]);

  // Remove hospital association by hospital admin
  const removeHospitalByAdmin = useCallback(async (doctorId: number) => {
    try {
      setLoading(true);
      setError('');
      await doctorApi.updateHospitalByHospitalAdmin(doctorId);
      
      // Update doctor in current profile if it matches
      if (doctor && doctor.doctor_id === doctorId) {
        setDoctor(prev => prev ? { ...prev, hospital_id: undefined, hospital_name: undefined } : null);
      }
      
      // Update doctor in doctors list
      setDoctors(prev => prev.map(doc => 
        doc.doctor_id === doctorId 
          ? { ...doc, hospital_id: undefined, hospital_name: undefined }
          : doc
      ));
      
      setSuccess('Doctor removed from hospital');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to remove doctor from hospital';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [doctor]);

  // Memoized return value
  const returnValue = useMemo(() => ({
    doctor,
    doctors,
    loading,
    error,
    success,
    clearMessages,
    getDoctor,
    getDoctorsForAppointmentBooking,
    getHospitalAssociatedDoctors,
    updateDoctor,
    updateDoctorStatus,
    updateHospitalByDoctor,
    removeHospitalByAdmin,
  }), [
    doctor,
    doctors,
    loading,
    error,
    success,
    clearMessages,
    getDoctor,
    getDoctorsForAppointmentBooking,
    getHospitalAssociatedDoctors,
    updateDoctor,
    updateDoctorStatus,
    updateHospitalByDoctor,
    removeHospitalByAdmin,
  ]);

  return returnValue;
}

export default useDoctor;