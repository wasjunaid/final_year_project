import type { AssociatedMedicalCoderDto } from './dto';
import type { AssociatedMedicalCoderModel } from './model';

export const toAssociatedMedicalCoderModel = (
  d: AssociatedMedicalCoderDto
): AssociatedMedicalCoderModel => ({
  id: d.medical_coder_id,
  hospitalId: d.hospital_id,
  status: d.medical_coder_status,
  firstName: d.medical_coder_first_name,
  lastName: d.medical_coder_last_name,
  email: d.medical_coder_email,
  fullName: `${d.medical_coder_first_name} ${d.medical_coder_last_name}`.trim(),
});
