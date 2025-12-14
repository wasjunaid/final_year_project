import { LabTestRepository } from "../../repositories/labTest";
import createLabTestController from "./useLabTestController";

// export a hook function that calls the controller factory with the repository
const useLabTestController = () => createLabTestController(LabTestRepository);

export default useLabTestController;