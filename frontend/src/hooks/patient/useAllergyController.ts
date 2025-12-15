import { useCallback, useState } from "react";
import type { IAllergyRepository } from "../../repositories/patient/allergyRepository";
import type { Allergy } from "../../models/patient/allergy/model";
import type { CreateAllergyPayload } from "../../models/patient/allergy/payload";

export interface IAllergyController {
  // State
  allergies: Allergy[];
  loading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchAllergiesForDoctor: (patientId: number) => Promise<Allergy[]>;
  createAllergyForDoctor: (patientId: number, payload: CreateAllergyPayload) => Promise<Allergy>;
  clearMessages: () => void;
}

const createAllergyController = (allergyRepository: IAllergyRepository): IAllergyController => {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAllergiesForDoctor = useCallback(async (patientId: number): Promise<Allergy[]> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await allergyRepository.getAllergiesForDoctor(patientId);
      setAllergies(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch allergies';
      setError(errorMessage);
      console.error('Error fetching allergies:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [allergyRepository]);

  const createAllergyForDoctor = useCallback(async (patientId: number, payload: CreateAllergyPayload): Promise<Allergy> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newItem = await allergyRepository.createAllergyForDoctor(patientId, payload);
      setAllergies(prev => [...prev, newItem]);
      setSuccess('Allergy added successfully');
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add allergy';
      setError(errorMessage);
      console.error('Error adding allergy:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [allergyRepository]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    allergies,
    loading,
    error,
    success,
    clearMessages,
    fetchAllergiesForDoctor,
    createAllergyForDoctor,
  };
};

export default createAllergyController;
