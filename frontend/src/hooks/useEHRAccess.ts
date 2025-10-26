import { useState, useCallback, useMemo } from 'react';
import { ehrAccessApi } from '../services/ehrAccessApi';
import type { 
  EHRAccess, 
  CreateEHRAccessRequest
} from '../models/EHRAccess';
import StatusCodes from '../constants/StatusCodes';

export function useEHRAccess() {
  const [ehrAccessRequests, setEhrAccessRequests] = useState<EHRAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get EHR access requests for patient
  const getForPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ehrAccessApi.getForPatient();
      setEhrAccessRequests(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setEhrAccessRequests([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch EHR access requests';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get EHR access requests for doctor
  const getForDoctor = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ehrAccessApi.getForDoctor();
      setEhrAccessRequests(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setEhrAccessRequests([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch EHR access requests';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Request EHR access by doctor
  const requestByDoctor = useCallback(async (data: CreateEHRAccessRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await ehrAccessApi.requestByDoctor(data);
      setEhrAccessRequests(prev => [response.data, ...prev]);
      setSuccess('EHR access request sent successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to request EHR access';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Deny EHR access request by patient
  const denyByPatient = useCallback(async (ehrAccessRequestId: number) => {
    try {
      setLoading(true);
      setError('');
      await ehrAccessApi.denyByPatient(ehrAccessRequestId);
      setEhrAccessRequests(prev => prev.map(request => 
        request.ehr_access_id === ehrAccessRequestId 
          ? { ...request, status: 'DENIED' as const }
          : request
      ));
      setSuccess('EHR access request denied');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to deny EHR access request';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Grant EHR access request by patient
  const grantByPatient = useCallback(async (ehrAccessRequestId: number) => {
    try {
      setLoading(true);
      setError('');
      await ehrAccessApi.grantByPatient(ehrAccessRequestId);
      setEhrAccessRequests(prev => prev.map(request => 
        request.ehr_access_id === ehrAccessRequestId 
          ? { ...request, status: 'GRANTED' as const, granted_at: new Date().toISOString() }
          : request
      ));
      setSuccess('EHR access granted successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to grant EHR access';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Revoke EHR access by patient
  const revokeByPatient = useCallback(async (ehrAccessRequestId: number) => {
    try {
      setLoading(true);
      setError('');
      await ehrAccessApi.revokeByPatient(ehrAccessRequestId);
      setEhrAccessRequests(prev => prev.map(request => 
        request.ehr_access_id === ehrAccessRequestId 
          ? { ...request, status: 'REVOKED' as const, revoked_at: new Date().toISOString() }
          : request
      ));
      setSuccess('EHR access revoked');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to revoke EHR access';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    ehrAccessRequests,
    loading,
    error,
    success,
    clearMessages,
    getForPatient,
    getForDoctor,
    requestByDoctor,
    denyByPatient,
    grantByPatient,
    revokeByPatient,
  }), [
    ehrAccessRequests,
    loading,
    error,
    success,
    clearMessages,
    getForPatient,
    getForDoctor,
    requestByDoctor,
    denyByPatient,
    grantByPatient,
    revokeByPatient,
  ]);

  return returnValue;
}

export default useEHRAccess;