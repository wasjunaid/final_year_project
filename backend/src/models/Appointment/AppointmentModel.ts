export interface AppointmentModel {
    appointment_id: number;
    patient_id: number;
    doctor_id: number;
    date: Date;
    time: Date;
    status: string;
}