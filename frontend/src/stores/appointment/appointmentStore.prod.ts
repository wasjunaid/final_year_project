import { createAppointmentRepository } from "../../repositories/appointment/appointmentRepository";
import { appointmentService } from "../../services/appointmentService";
import { createAppointmentStore } from "./createAppointmentStore";

const repo = createAppointmentRepository({ appointmentService });
export const useAppointmentStore = createAppointmentStore({ repository: repo });
