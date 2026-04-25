import AllergyService from "../../services/patient/allergyService";
import CreateAllergyRepository from "../../repositories/patient/allergyRepository";
import createAllergyController from "./useAllergyController";

const allergyService = new AllergyService();
const allergyRepository = new CreateAllergyRepository(allergyService);

export const useAllergyController = () => {
  return createAllergyController(allergyRepository);
};
