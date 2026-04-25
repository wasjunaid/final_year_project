import appointmentService from '../../services/appointment/appointmentService';
import type { AppointmentModel } from '../../models/appointment/model';
import type { PatientRescheduleAppointmentPayload, HospitalRescheduleAppointmentPayload, CompleteDoctorPayload, DoctorFollowUpPayload, UpdateNotesDoctorPayload, DischargePayload } from '../../models/appointment/payload';
import { toAppointmentModels } from '../../models/appointment/transformers';
import { AppError } from '../../utils/appError';

const appointmentRepository = {
  async fetchForPatient(): Promise<AppointmentModel[]> {
    try {
      const resp = await appointmentService.getForPatient();
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to fetch', title: 'Fetch Failed' });
      return toAppointmentModels(resp.data || []);
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      // 404 = no appointments found, treat as empty list
      if (err?.response?.status === 404) return [];
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch';
      throw new AppError({ message: msg, title: 'Fetch Failed' });
    }
  },

  async fetchForDoctor(): Promise<AppointmentModel[]> {
    try {
      const resp = await appointmentService.getForDoctor();
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to fetch', title: 'Fetch Failed' });
      return toAppointmentModels(resp.data || []);
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err?.response?.status === 404) return [];
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch';
      throw new AppError({ message: msg, title: 'Fetch Failed' });
    }
  },

  async fetchForHospital(): Promise<AppointmentModel[]> {
    try {
      const resp = await appointmentService.getForHospital();
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to fetch', title: 'Fetch Failed' });
      return toAppointmentModels(resp.data || []);
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err?.response?.status === 404) return [];
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch';
      throw new AppError({ message: msg, title: 'Fetch Failed' });
    }
  },

  async create(payload: any) {
    try {
      const resp = await appointmentService.create(payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to create', title: 'Creation Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to create';
      throw new AppError({ message: msg, title: 'Creation Failed' });
    }
  },

  async createDoctorFollowUp(appointmentId: number, payload: DoctorFollowUpPayload) {
    try {
      const resp = await appointmentService.createDoctorFollowUp(appointmentId, payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to create follow-up', title: 'Follow-up Creation Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to create follow-up';
      throw new AppError({ message: msg, title: 'Follow-up Creation Failed' });
    }
  },

  async createPatientFollowUp(appointmentId: number, payload: DoctorFollowUpPayload) {
    try {
      const resp = await appointmentService.createPatientFollowUp(appointmentId, payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to create follow-up', title: 'Follow-up Creation Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to create follow-up';
      throw new AppError({ message: msg, title: 'Follow-up Creation Failed' });
    }
  },

  async cancel(appointmentId: number) {
    try {
      const resp = await appointmentService.cancel(appointmentId);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to cancel', title: 'Cancel Failed' });
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel';
      throw new AppError({ message: msg, title: 'Cancel Failed' });
    }
  },

  async approve(appointmentId: number, payload: any) {
    try {
      const resp = await appointmentService.approve(appointmentId, payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to approve', title: 'Approve Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve';
      throw new AppError({ message: msg, title: 'Approve Failed' });
    }
  },

  async deny(appointmentId: number) {
    try {
      const resp = await appointmentService.deny(appointmentId);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to deny', title: 'Deny Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to deny';
      throw new AppError({ message: msg, title: 'Deny Failed' });
    }
  },

  async rescheduleForPatient(appointmentId: number, payload: PatientRescheduleAppointmentPayload) {
    try {
      const resp = await appointmentService.rescheduleForPatient(appointmentId, payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to reschedule', title: 'Reschedule Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to reschedule';
      throw new AppError({ message: msg, title: 'Reschedule Failed' });
    }
  },

  async rescheduleForHospital(appointmentId: number, payload: HospitalRescheduleAppointmentPayload) {
    try {
      const resp = await appointmentService.rescheduleForHospital(appointmentId, payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to reschedule', title: 'Reschedule Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to reschedule';
      throw new AppError({ message: msg, title: 'Reschedule Failed' });
    }
  },

  async start(appointmentId: number) {
    try {
      const resp = await appointmentService.startStart(appointmentId);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to start', title: 'Start Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to start';
      throw new AppError({ message: msg, title: 'Start Failed' });
    }
  },

  async hospitalize(appointmentId: number) {
    try {
      const resp = await appointmentService.hospitalize(appointmentId);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to hospitalize appointment', title: 'Hospitalization Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to hospitalize appointment';
      throw new AppError({ message: msg, title: 'Hospitalization Failed' });
    }
  },

  async discharge(appointmentId: number, payload: DischargePayload) {
    try {
      const resp = await appointmentService.discharge(appointmentId, payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to discharge appointment', title: 'Discharge Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to discharge appointment';
      throw new AppError({ message: msg, title: 'Discharge Failed' });
    }
  },

  async updateNotes(appointmentId: number, payload: UpdateNotesDoctorPayload) {
    try {
      const resp = await appointmentService.updateNotes(appointmentId, payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to update notes', title: 'Update Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to update notes';
      throw new AppError({ message: msg, title: 'Update Failed' });
    }
  },

  // async requireLabTest(appointmentId: number) {
  //   try {
  //     const resp = await appointmentService.requireLabTest(appointmentId);
  //     if (!resp.success) throw new AppError({ message: resp.message || 'Failed to set lab test', title: 'Lab Test Failed' });
  //     return toAppointmentModels([resp.data])[0];
  //   } catch (err: any) {
  //     if (err instanceof AppError) throw err;
  //     const msg = err?.response?.data?.message || err?.message || 'Failed to set lab test';
  //     throw new AppError({ message: msg, title: 'Lab Test Failed' });
  //   }
  // },

  // async requirePrescription(appointmentId: number) {
  //   try {
  //     const resp = await appointmentService.requirePrescription(appointmentId);
  //     if (!resp.success) throw new AppError({ message: resp.message || 'Failed to set prescription', title: 'Prescription Failed' });
  //     return toAppointmentModels([resp.data])[0];
  //   } catch (err: any) {
  //     if (err instanceof AppError) throw err;
  //     const msg = err?.response?.data?.message || err?.message || 'Failed to set prescription';
  //     throw new AppError({ message: msg, title: 'Prescription Failed' });
  //   }
  // },

  async completeDoctor(appointmentId: number, payload: CompleteDoctorPayload) {
    try {
      const resp = await appointmentService.completeDoctor(appointmentId, payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to complete', title: 'Complete Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to complete';
      throw new AppError({ message: msg, title: 'Complete Failed' });
    }
  },

  async completeLabTests(appointmentId: number) {
    try {
      const resp = await appointmentService.completeLabTests(appointmentId);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to complete lab tests', title: 'Complete Lab Tests Failed' });
      return toAppointmentModels([resp.data])[0];
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to complete lab tests';
      throw new AppError({ message: msg, title: 'Complete Lab Tests Failed' });
    }
  },

  // async completeLabTest(appointmentId: number) {
  //   try {
  //     const resp = await appointmentService.completeLabTest(appointmentId);
  //     if (!resp.success) throw new AppError({ message: resp.message || 'Failed to complete lab test', title: 'Complete Lab Test Failed' });
  //     return toAppointmentModels([resp.data])[0];
  //   } catch (err: any) {
  //     if (err instanceof AppError) throw err;
  //     const msg = err?.response?.data?.message || err?.message || 'Failed to complete lab test';
  //     throw new AppError({ message: msg, title: 'Complete Lab Test Failed' });
  //   }
  // },

  // async completePrescription(appointmentId: number) {
  //   try {
  //     const resp = await appointmentService.completePrescription(appointmentId);
  //     if (!resp.success) throw new AppError({ message: resp.message || 'Failed to complete prescription', title: 'Complete Prescription Failed' });
  //     return toAppointmentModels([resp.data])[0];
  //   } catch (err: any) {
  //     if (err instanceof AppError) throw err;
  //     const msg = err?.response?.data?.message || err?.message || 'Failed to complete prescription';
  //     throw new AppError({ message: msg, title: 'Complete Prescription Failed' });
  //   }
  // },
};

export default appointmentRepository;
