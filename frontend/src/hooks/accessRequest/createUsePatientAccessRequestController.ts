import { useState } from 'react';
import accessRequestRepository from '../../repositories/accessRequest/accessRequestRepository';

export const createUsePatientAccessRequestController = ({ repository = accessRequestRepository }: { repository?: any } = {}) => {
  return () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchRequestsForPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await repository.fetchRequestsForPatient();
        setRequests(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    const acceptRequest = async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await repository.acceptRequest(id);
        setRequests((p) => p.filter((r: any) => r.accessRequestId !== id));
        setSuccess('Request accepted');
      } catch (err: any) {
        setError(err.message || 'Failed to accept request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const denyRequest = async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await repository.denyRequest(id);
        setRequests((p) => p.filter((r: any) => r.accessRequestId !== id));
        setSuccess('Request denied');
      } catch (err: any) {
        setError(err.message || 'Failed to deny request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const revokeRequest = async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await repository.revokeRequest(id);
        setRequests((p) => p.filter((r: any) => r.accessRequestId !== id));
        setSuccess('Request denied');
      } catch (err: any) {
        setError(err.message || 'Failed to deny request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const deleteRequest = async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await repository.deleteRequest(id);
        setRequests((p) => p.filter((r: any) => r.accessRequestId !== id));
        setSuccess('Request removed');
      } catch (err: any) {
        setError(err.message || 'Failed to remove request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // fetch on mount
    // mount disabled for access controllers as they are called in a single page leading to forbidden access error on backend
    // useEffect(() => {
    //   fetchRequestsForPatient();
    // }, []);

    const clearMessages = () => { setError(null); setSuccess(null); };

    return {
      requests,
      loading,
      error,
      success,
      fetchRequestsForPatient,
      acceptRequest,
      denyRequest,
      revokeRequest,
      deleteRequest,
      clearMessages,
      setError,
      setSuccess,
    };
  };
};
