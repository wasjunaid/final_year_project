import type { Appointment } from "../../../models/Appointment";
import AppointmentDetailsPage from "../AppointmentDetailPage";

function AppointmentDetailsTestPage() {
  const mockAppointment: Appointment = {
    appointment_id: 1,
    status: "confirmed",
    cost: 200,
    date: "2025-10-01",
    time: "15:00",
    reason: "Follow-up visit",
    created_at: "2025-09-01T10:00:00Z",
    updated_at: "2025-09-01T11:00:00Z",
    patient_first_name: "John",
    patient_last_name: "Doe",
    patient_email: "john@example.com",
    doctor_first_name: "Alice",
    doctor_last_name: "Smith",
    doctor_email: "alice@example.com",
    specialization: "Dermatology",
    hospital_name: "City Hospital",
    hospital_address: "123 Main St",
    doctor_note: "Healing well.",
  };

  return <AppointmentDetailsPage state={mockAppointment} />;
}

export default AppointmentDetailsTestPage;
