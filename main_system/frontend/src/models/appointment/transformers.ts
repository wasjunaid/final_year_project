import type { AppointmentBookingDoctorDto, AppointmentDto } from './dto';
import type { AppointmentBookingDoctorModel, AppointmentModel } from './model';
import type { AppointmentStatusType } from './enums';
import { normalizeDateTime, toBool, toNullableString, toNumberOrNull } from './helpers';

export const toAppointmentModel = (d: AppointmentDto): AppointmentModel => {
  const { scheduledAt, date, time } = normalizeDateTime(d.date ?? null, d.time ?? null);

  const patientName = toNullableString(d.patient_name ?? (d as any).patientName);
  const doctorName = toNullableString(d.doctor_name ?? (d as any).doctorName);
  const hospitalName = toNullableString(d.hospital_name ?? (d as any).hospitalName);

  const notes = toNullableString(d.doctor_note ?? d.reason ?? null);

  const historyOfPresentIllness = toNullableString((d as any).history_of_present_illness ?? null);
  const reviewOfSystems = toNullableString((d as any).review_of_systems ?? null);
  const physicalExam = toNullableString((d as any).physical_exam ?? null);
  const diagnosis = toNullableString((d as any).diagnosis ?? null);
  const plan = toNullableString((d as any).plan ?? null);

  const diagnosisList: string[] = (diagnosis || '')
    .split(',')
    .map((s) => String(s || '').trim())
    .filter((s) => s.length > 0);

  return {
    appointmentId: Number(d.appointment_id),
    patientId: Number(d.patient_id),
    doctorId: Number(d.doctor_id),
    hospitalId: d.hospital_id ?? null,

    scheduledAt,
    date,
    time,

    patientName,
    doctorName,
    hospitalName,

    appointmentCost: toNumberOrNull((d as any).appointment_cost ?? null),
    // labTestCost: toNumberOrNull((d as any).lab_test_cost ?? null),
    // totalCost: toNumberOrNull((d as any).total_cost ?? null),

    notes,
    appointmentType: toNullableString((d as any).appointment_type ?? null),
    parentAppointmentId: toNumberOrNull((d as any).parent_appointment_id ?? null),
    followUpNotes: toNullableString((d as any).follow_up_notes ?? null),
    admissionDate: toNullableString((d as any).admission_date ?? null),
    dischargeDate: toNullableString((d as any).discharge_date ?? null),

    historyOfPresentIllness,
    reviewOfSystems,
    physicalExam,
    diagnosis,
    diagnosisList,
    plan,

    status: (d.status ?? '') as AppointmentStatusType | string,

    doctorCompleted: toBool(d.doctor_completed),
    doctorCompletedAt: toNullableString(d.doctor_completed_at),

    // labTestRequired: toBool(d.lab_test_required),
      labTestsOrdered: toBool((d as any).lab_tests_ordered ?? (d as any).lab_test_ordered ?? (d as any).lab_test_required),
      labTestsCompleted: toBool((d as any).lab_tests_completed ?? (d as any).lab_test_completed),
      labTestsCompletedAt: toNullableString((d as any).lab_tests_completed_at ?? (d as any).lab_test_completed_at),

    // prescriptionRequired: toBool(d.prescription_required),
    // prescriptionCompleted: toBool(d.prescription_completed),
    // prescriptionCompletedAt: toNullableString(d.prescription_completed_at),
    // prescriptionCompletedBy: (d.prescription_completed_by ?? null) as number | null,

    isFullyCompleted: toBool(d.is_fully_completed),

    createdAt: toNullableString(d.created_at),
    updatedAt: toNullableString(d.updated_at),
  };
};

export const toAppointmentModels = (arr: AppointmentDto[] = []): AppointmentModel[] => arr.map(toAppointmentModel);

export const toDoctorsForAppointmentBookingModel = (d: AppointmentBookingDoctorDto): AppointmentBookingDoctorModel => ({
  id: d.doctor_id,
  hospitalId: d.hospital_id,
  specialization: d.specialization ?? null,
  yearsOfExperience: d.years_of_experience ?? null,
  licenseNumber: d.license_number ?? null,
  sittingStart: d.sitting_start ?? null,
  sittingEnd: d.sitting_end ?? null,
  status: d.doctor_status,
  firstName: d.doctor_first_name,
  lastName: d.doctor_last_name,
  email: d.doctor_email,
  fullName: `${d.doctor_first_name} ${d.doctor_last_name}`.trim(),
});
