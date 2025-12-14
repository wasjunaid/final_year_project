import { useCallback, useEffect, useState } from "react";
import type { ILabTestRepository } from "../../repositories/labTest";
import type { LabTest } from "../../models/labTest/model";
import type { CreateLabTestPayload, UpdateLabTestPayload } from "../../models/labTest/payload";

export interface ILabTestManagementController {
  // State
  labTests: LabTest[];
  loading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchAllLabTests: () => Promise<LabTest[]>;
  createLabTest: (payload: CreateLabTestPayload) => Promise<LabTest>;
  updateLabTest: (labTestId: number, payload: UpdateLabTestPayload) => Promise<LabTest>;
  clearMessages: () => void;
}

const createLabTestController = (labTestRepository: ILabTestRepository): ILabTestManagementController => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAllLabTests = useCallback(async (): Promise<LabTest[]> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await labTestRepository.getAllLabTestsIfExists();
      setLabTests(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lab tests';
      setError(errorMessage);
      console.error('Error fetching lab tests:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [labTestRepository]);

  const createLabTest = useCallback(async (payload: CreateLabTestPayload): Promise<LabTest> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newLabTest = await labTestRepository.createLabTest(payload);
      setLabTests(prev => [...prev, newLabTest]);
      setSuccess('Lab test created successfully');
      return newLabTest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lab test';
      setError(errorMessage);
      console.error('Error creating lab test:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [labTestRepository]);

  const updateLabTest = useCallback(async (labTestId: number, payload: UpdateLabTestPayload): Promise<LabTest> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedLabTest = await labTestRepository.updateLabTest(labTestId, payload);
      setLabTests(prev => prev.map(lt => lt.labTestId === labTestId ? updatedLabTest : lt));
      setSuccess('Lab test updated successfully');
      return updatedLabTest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lab test';
      setError(errorMessage);
      console.error('Error updating lab test:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [labTestRepository]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // auto fetch on mount
  useEffect(() => {
    fetchAllLabTests();
  }, [fetchAllLabTests]);

  return {
    labTests,
    loading,
    error,
    success,
    clearMessages,
    fetchAllLabTests,
    createLabTest,
    updateLabTest,
  };
};

export default createLabTestController;