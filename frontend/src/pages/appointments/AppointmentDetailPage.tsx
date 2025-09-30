import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Appointment } from "../../models/appointment";

function AppointmentDetailsPage() {
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const details: Appointment | undefined = state as Appointment;

  if (!details) {
    return (
      <div className="p-8">
        <p>No details found for appointment {id}.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold mb-4">Appointment Details</h2>

      <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded shadow">
        <div>
          <h3 className="font-semibold">Doctor</h3>
          <p>
            {details.doctor_first_name} {details.doctor_last_name}
          </p>
          <p className="text-sm text-gray-600">{details.doctor_email}</p>
          {details.specialization && (
            <p className="text-sm text-gray-600">
              Specialization: {details.specialization}
            </p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Hospital</h3>
          <p>{details.hospital_name}</p>
          <p className="text-sm text-gray-600">{details.hospital_address}</p>
        </div>

        <div>
          <h3 className="font-semibold">Patient</h3>
          <p>
            {details.patient_first_name} {details.patient_last_name}
          </p>
          <p className="text-sm text-gray-600">{details.patient_email}</p>
        </div>

        <div>
          <h3 className="font-semibold">Appointment</h3>
          <p>Date: {details.date}</p>
          <p>Time: {details.time}</p>
          <p>Reason: {details.reason}</p>
          <p>Status: {details.status}</p>
          <p>Cost: {details.cost}</p>
          {details.doctor_note && (
            <p className="text-sm text-gray-600">
              Doctor Note: {details.doctor_note}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Back
      </button>
    </div>
  );
}

export default AppointmentDetailsPage;
