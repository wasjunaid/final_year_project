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
  },

  async removeDoctorHospitalAssociation(
    doctorId: number,
    payload?: { reassignment_mode?: 'manual' | 'automatic'; reassigned_doctor_id?: number }
  ): Promise<void> {
    const resp = await associatedStaffService.removeDoctorHospitalAssociation(doctorId, payload);
    if (!resp.success) {
      throw new Error(resp.message || 'Failed to remove doctor association');
    }
  }
};

export default associatedStaffRepository;
