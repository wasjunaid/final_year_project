import { useState, useCallback, useMemo } from 'react';
import { hospitalAssociationRequestApi } from '../services/hospitalAssociationRequestApi';
import type { 
  HospitalAssociationRequest, 
  CreateHospitalAssociationRequest
} from '../models/HospitalAssociationRequest';
import StatusCodes from '../constants/StatusCodes';

export function useHospitalAssociationRequest() {
  const [requests, setRequests] = useState<HospitalAssociationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get requests by person
  const getByPerson = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalAssociationRequestApi.getByPerson();
      setRequests(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setRequests([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch association requests';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get requests by hospital
  const getByHospital = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalAssociationRequestApi.getByHospital();
      setRequests(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setRequests([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch association requests';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new association request
  const createRequest = useCallback(async (data: CreateHospitalAssociationRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalAssociationRequestApi.insert(data);
      setRequests(prev => [response.data, ...prev]);
      setSuccess('Association request submitted successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to submit association request';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve association request
  const approveRequest = useCallback(async (requestId: number) => {
    try {
      setLoading(true);
      setError('');
      await hospitalAssociationRequestApi.approve(requestId);
      setRequests(prev => prev.map(request => 
        request.hospital_association_request_id === requestId 
          ? { ...request, status: 'APPROVED' as const }
          : request
      ));
      setSuccess('Association request approved');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to approve association request';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete request by staff
  const deleteByStaff = useCallback(async (requestId: number) => {
    try {
      setLoading(true);
      setError('');
      await hospitalAssociationRequestApi.deleteByStaff(requestId);
      setRequests(prev => prev.filter(request => 
        request.hospital_association_request_id !== requestId
      ));
      setSuccess('Association request deleted');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to delete association request';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete request by person
  const deleteByPerson = useCallback(async (requestId: number) => {
    try {
      setLoading(true);
      setError('');
      await hospitalAssociationRequestApi.deleteByPerson(requestId);
      setRequests(prev => prev.filter(request => 
        request.hospital_association_request_id !== requestId
      ));
      setSuccess('Association request cancelled');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to cancel association request';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete all requests by person
  const deleteAllByPerson = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      await hospitalAssociationRequestApi.deleteAllByPerson();
      setRequests([]);
      setSuccess('All association requests cancelled');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to cancel all association requests';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    requests,
    loading,
    error,
    success,
    clearMessages,
    getByPerson,
    getByHospital,
    createRequest,
    approveRequest,
    deleteByStaff,
    deleteByPerson,
    deleteAllByPerson,
  }), [
    requests,
    loading,
    error,
    success,
    clearMessages,
    getByPerson,
    getByHospital,
    createRequest,
    approveRequest,
    deleteByStaff,
    deleteByPerson,
    deleteAllByPerson,
  ]);

  return returnValue;
}

export default useHospitalAssociationRequest;