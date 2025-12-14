import LabTestService from "../../services/labTest/LabTestService";
import CreateLabTestRepository from "./labTestRepository";

const labTestService = new LabTestService();
const LabTestRepository = new CreateLabTestRepository(labTestService);

export default LabTestRepository;