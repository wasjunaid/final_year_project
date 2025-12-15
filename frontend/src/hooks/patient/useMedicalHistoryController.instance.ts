import MedicalHistoryService from "../../services/patient/medicalHistoryService";
import CreateMedicalHistoryRepository from "../../repositories/patient/medicalHistoryRepository";
import createMedicalHistoryController from "./useMedicalHistoryController";

const medicalHistoryService = new MedicalHistoryService();
const medicalHistoryRepository = new CreateMedicalHistoryRepository(medicalHistoryService);

export const useMedicalHistoryController = () => {
  return createMedicalHistoryController(medicalHistoryRepository);
};
