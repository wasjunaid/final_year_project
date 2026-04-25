import SurgicalHistoryService from "../../services/patient/surgicalHistoryService";
import CreateSurgicalHistoryRepository from "../../repositories/patient/surgicalHistoryRepository";
import createSurgicalHistoryController from "./useSurgicalHistoryController";

const surgicalHistoryService = new SurgicalHistoryService();
const surgicalHistoryRepository = new CreateSurgicalHistoryRepository(surgicalHistoryService);

export const useSurgicalHistoryController = () => {
  return createSurgicalHistoryController(surgicalHistoryRepository);
};
