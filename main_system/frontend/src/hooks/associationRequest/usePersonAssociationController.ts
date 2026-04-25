import { useState, useEffect } from 'react';
import type { PersonAssociationRequestModel } from '../../models/associationRequest/person/model';

// Factory to create controller with DI for repository
export const createUsePersonAssociationController = ({ personAssociationRepository }: { personAssociationRepository: any }) => {
  return () => {
    const [requests, setRequests] = useState<PersonAssociationRequestModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchRequestsForPerson = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const data = await personAssociationRepository.getRequestsForPerson();
        setRequests(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    const deletePersonRequest = async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await personAssociationRepository.deletePersonRequest(id);
        setRequests((prev) => prev.filter((r) => r.hospital_association_request_id !== id));
        setSuccess('Request deleted');
      } catch (err: any) {
        setError(err.message || 'Failed to delete request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const deleteAllPersonRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await personAssociationRepository.deleteAllPersonRequests();
        setRequests([]);
        setSuccess('All requests deleted');
      } catch (err: any) {
        setError(err.message || 'Failed to delete requests');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const acceptRequest = async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await personAssociationRepository.acceptRequest(id);
        setRequests((prev) => prev.filter((r) => r.hospital_association_request_id !== id));
        setSuccess('Request accepted');
      } catch (err: any) {
        setError(err.message || 'Failed to accept request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchRequestsForPerson();
    }, []);

    const clearMessages = () => {
      setError(null);
      setSuccess(null);
    };

    return {
      requests,
      loading,
      error,
      success,

      setError,
      setSuccess,

      fetchRequestsForPerson,
      deletePersonRequest,
      deleteAllPersonRequests,
      acceptRequest,
      clearMessages,
    };
  };
};
