export const CreateAppointmentPayload = {
  title: '' as string,
  starts_at: '' as string, // ISO string
  patient_id: null as string | null,
};

export const UpdateAppointmentPayload = {
  title: '' as string,
  starts_at: '' as string, // ISO string
  patient_id: null as string | null,
};

export const DeleteAppointmentPayload = {
  id: '' as string,
};