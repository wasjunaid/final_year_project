import { hospitalAssociationRepository } from "../../repositories/associationRequest";
import { createUseHospitalAssociationController } from "./useHospitalAssociationController";

export const useHospitalAssociationController = createUseHospitalAssociationController({ hospitalAssociationRepository });
