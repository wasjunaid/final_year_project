import { useState, useCallback } from 'react';
import { ehrAccessApi } from '../services/ehrAccessApi';
import type { 
  EHRAccess, 
  CreateEHRAccessRequest 
} from '../models/EHRAccess';

export function useEHRAccess() {
  const [accesses, setAccesses] = useState<EHRAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Clear messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Request access by doctor
  const requestByDoctor = useCallback(async (data: CreateEHRAccessRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await ehrAccessApi.requestByDoctor(data);
      
      if (response.data) {
        setAccesses(prev => [response.data!, ...prev]);
      }
      
      setSuccess('Access request sent successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to send access request';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get access requests for doctor
  const getForDoctor = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await ehrAccessApi.getForDoctor();
      setAccesses(response.data || []);
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch access requests';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get access requests for patient
  const getForPatient = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await ehrAccessApi.getForPatient();
      setAccesses(response.data || []);
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch access requests';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Grant access by patient
  const grantByPatient = useCallback(async (ehr_access_id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await ehrAccessApi.grantByPatient(ehr_access_id);
      
      setAccesses(prev => prev.map(access => 
        access.ehr_access_id === ehr_access_id 
          ? { ...access, status: 'GRANTED' as const }
          : access
      ));
      
      setSuccess('Access granted successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to grant access';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deny access by patient
  const denyByPatient = useCallback(async (ehr_access_id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await ehrAccessApi.denyByPatient(ehr_access_id);
      
      setAccesses(prev => prev.map(access => 
        access.ehr_access_id === ehr_access_id 
          ? { ...access, status: 'DENIED' as const }
          : access
      ));
      
      setSuccess('Access denied successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to deny access';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Revoke access
  const revoke = useCallback(async (ehr_access_id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await ehrAccessApi.revoke(ehr_access_id);
      
      setAccesses(prev => prev.filter(access => access.ehr_access_id !== ehr_access_id));
      
      setSuccess('Access revoked successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to revoke access';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    accesses,
    loading,
    error,
    success,
    requestByDoctor,
    getForDoctor,
    getForPatient,
    grantByPatient,
    denyByPatient,
    revoke,
    clearMessages,
  };
}

export default useEHRAccess;