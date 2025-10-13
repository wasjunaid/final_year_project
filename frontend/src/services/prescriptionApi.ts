import api from "./api";
import EndPoints from "../constants/endpoints";
import type { ApiResponse } from "../models/ApiResponse";
import type {
  Prescription,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
} from "../models/Prescription";

class PrescriptionApi {
  static async getByAppointmentId(
    id: number
  ): Promise<ApiResponse<Prescription[]>> {
    const response = await api.get(
      EndPoints.prescription.getByAppointment.replace(
        ":appointment_id",
        String(id)
      )
    );
    return response.data;
  }

  static async getAllForPatient(): Promise<ApiResponse<Prescription[]>> {
    const response = await api.get(EndPoints.prescription.getAll);
    return response.data;
  }

  static async getAllForDoctor(): Promise<ApiResponse<Prescription[]>> {
    const response = await api.get(EndPoints.prescription.getAll);
    return response.data;
  }

  static async create(
    payload: CreatePrescriptionRequest
  ): Promise<ApiResponse<Prescription>> {
    const response = await api.post(EndPoints.prescription.create, payload);
    return response.data;
  }

  static async update(
    payload: UpdatePrescriptionRequest
  ): Promise<ApiResponse<Prescription>> {
    const response = await api.put(
      EndPoints.prescription.update.replace(
        ":prescription_id",
        String(payload.prescription_id)
      ),
      payload
    );
    return response.data;
  }

  static async remove(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(
      EndPoints.prescription.delete.replace(":prescription_id", String(id))
    );
    return response.data;
  }
}

export default PrescriptionApi;
