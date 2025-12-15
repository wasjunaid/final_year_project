import FamilyHistoryService from "../../services/patient/familyHistoryService";
import CreateFamilyHistoryRepository from "../../repositories/patient/familyHistoryRepository";
import createFamilyHistoryController from "./useFamilyHistoryController";

const familyHistoryService = new FamilyHistoryService();
const familyHistoryRepository = new CreateFamilyHistoryRepository(familyHistoryService);

export const useFamilyHistoryController = () => {
  return createFamilyHistoryController(familyHistoryRepository);
};
