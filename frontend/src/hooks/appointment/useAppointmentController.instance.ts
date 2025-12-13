import appointmentRepository from '../../repositories/appointment/appointmentRepository';
import { createUseAppointmentController } from './useAppointmentController';

export const useAppointmentController = createUseAppointmentController({ appointmentRepository });
