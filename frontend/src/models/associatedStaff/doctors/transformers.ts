import type { AssociatedDoctorDto } from './dto';
import type { AssociatedDoctorModel } from './model';

export const toAssociatedDoctorModel = (d: AssociatedDoctorDto): AssociatedDoctorModel => ({
  id: d.doctor_id,
  hospitalId: d.hospital_id,
  specialization: d.specialization ?? null,
  licenseNumber: d.license_number ?? null,
  sittingStart: d.sitting_start ?? null,
  sittingEnd: d.sitting_end ?? null,
  status: d.doctor_status,
  firstName: d.doctor_first_name,
  lastName: d.doctor_last_name,
  email: d.doctor_email,
  fullName: `${d.doctor_first_name} ${d.doctor_last_name}`.trim(),
});
