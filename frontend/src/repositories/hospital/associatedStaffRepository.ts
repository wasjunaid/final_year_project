import associatedStaffService from '../../services/hospital/associatedStaffService';
import type { AssociatedDoctorModel, AssociatedMedicalCoderModel } from '../../models/associatedStaff/model';
import { toAssociatedStaffModels } from '../../models/associatedStaff/transformers';

export const associatedStaffRepository = {
  async fetchAssociatedStaff(): Promise<{ doctors: AssociatedDoctorModel[]; medicalCoders: AssociatedMedicalCoderModel[] }>{
    const resp = await associatedStaffService.getAssociatedStaff();
    if (!resp.success) {
      throw new Error(resp.message || 'Failed to fetch associated staff');
    }

    const mapped = toAssociatedStaffModels(resp.data || { doctors: [], medicalCoders: [] });

    return {
      doctors: mapped.doctors,
      medicalCoders: mapped.medicalCoders,
    };
  }
};

export default associatedStaffRepository;
