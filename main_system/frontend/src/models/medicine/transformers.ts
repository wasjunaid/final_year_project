import type { MedicineDto } from './dto';
import type { MedicineModel } from './model';

export const toMedicineModel = (dto: MedicineDto): MedicineModel => {
  return {
    medicineId: dto.medicine_id,
    name: dto.name,
  };
};

export const toMedicineModels = (dtos: MedicineDto[]): MedicineModel[] => {
  return dtos.map(toMedicineModel);
};
