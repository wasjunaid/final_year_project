import { useState } from 'react';
import accessRequestRepository from '../../repositories/accessRequest/accessRequestRepository';
import type { CreateAccessRequestPayload } from '../../models/accessRequest/payload';

export const createUseDoctorAccessRequestController = ({ repository = accessRequestRepository }: { repository?: any } = {}) => {
  return () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchRequestsForDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await repository.fetchRequestsForDoctor();
        setRequests(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    const createRequest = async (payload: CreateAccessRequestPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const created = await repository.createRequest(payload);
        setRequests((p) => [...p, created]);
        setSuccess('Access request created');
        return created;
      } catch (err: any) {
        setError(err.message || 'Failed to create request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const cancelRequest = async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await repository.deleteRequest(id);
        setRequests((p) => p.filter((r: any) => r.accessRequestId !== id));
        setSuccess('Request deleted');
      } catch (err: any) {
        setError(err.message || 'Failed to delete request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // fetch on mount
    // mount disabled for access controllers as they are called in a single page leading to forbidden access error on backend
    // useEffect(() => {
    //   fetchRequestsForDoctor();
    // }, []);

    const clearMessages = () => {
      setError(null);
      setSuccess(null);
    }

    return {
      requests,
      loading,
      error,
      success,
      fetchRequestsForDoctor,
      createRequest,
      cancelRequest,
      setError,
      setSuccess,
      clearMessages,
    };
  };
};
