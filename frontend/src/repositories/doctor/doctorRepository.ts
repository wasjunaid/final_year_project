import doctorService from '../../services/doctor/doctorService';
import { toAssociatedDoctorModel } from '../../models/associatedStaff/transformers';
import type { AppointmentBookingDoctorModel } from '../../models/associatedStaff/doctors/model';
import { AppError } from '../../utils/appError';

const doctorRepository = {
  async fetchForAppointmentBooking(): Promise<AppointmentBookingDoctorModel[]> {
    try {
      const resp = await doctorService.getDoctorsForAppointmentBooking();
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to fetch doctors' });
      return (resp.data || []).map(toAssociatedDoctorModel);
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch doctors';
      throw new AppError({ message: msg });
    }
  }
};

export default doctorRepository;
