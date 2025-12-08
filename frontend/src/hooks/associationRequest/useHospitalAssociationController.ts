import { useState, useEffect } from 'react';
import type { HospitalAssociationRequestModel } from '../../models/associationRequest/hospital/model';
import type { CreateHospitalAssociationRequestPayload } from '../../models/associationRequest/hospital/payload';

// Factory to create controller with DI for repository
export const createUseHospitalAssociationController = ({ hospitalAssociationRepository }: { hospitalAssociationRepository: any }) => {
  return () => {
    const [requests, setRequests] = useState<HospitalAssociationRequestModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchRequestsForHospitalStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hospitalAssociationRepository.getRequestsForHospitalStaff();
        setRequests(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    const insertRequest = async (payload: CreateHospitalAssociationRequestPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const newReq = await hospitalAssociationRepository.insertRequest(payload);
        setRequests((prev) => [...prev, newReq]);
        setSuccess('Association request created');
        return newReq;
      } catch (err: any) {
        setError(err.message || 'Failed to create request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const deleteHospitalStaffRequest = async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await hospitalAssociationRepository.deleteHospitalStaffRequest(id);
        setRequests((prev) => prev.filter((r) => r.hospital_association_request_id !== id));
        setSuccess('Request deleted');
      } catch (err: any) {
        setError(err.message || 'Failed to delete request');
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
        await hospitalAssociationRepository.acceptRequest(id);
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
      fetchRequestsForHospitalStaff();
    }, []);

    const clearMessages = () => { setError(null); setSuccess(null); };

    return {
      requests,
      loading,
      error,
      success,

      setError,
      setSuccess,

      fetchRequestsForHospitalStaff,
      insertRequest,
      deleteHospitalStaffRequest,
      acceptRequest,
      clearMessages,
    };
  };
};
