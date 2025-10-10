import EndPoints from "../constants/endpoints";
import type { ApiResponse } from "../models/ApiResponse";
import type {
  CreatePatientInsuranceRequest,
  PatientInsurance,
  UpdatePatientInsuranceRequest,
} from "../models/PatientInsurance";
import api from "./api";

export class PatientInsuranceApi {
  // GET /patient/insurance
  static async getPatientInsurances(): Promise<
    ApiResponse<PatientInsurance[]>
  > {
    const response = await api.get(EndPoints.patientInsurance.getAll);
    return response.data;
  }

  // POST /patient/insurance
  static async createPatientInsurance(
    body: CreatePatientInsuranceRequest
  ): Promise<ApiResponse<PatientInsurance>> {
    const response = await api.post(EndPoints.patientInsurance.create, body);
    return response.data;
  }

  // PUT /patient/insurance/:patient_insurance_id
  static async updatePatientInsurance(
    patient_insurance_id: number,
    body: UpdatePatientInsuranceRequest
  ): Promise<ApiResponse<PatientInsurance>> {
    const response = await api.put(
      EndPoints.patientInsurance.update.replace(
        ":patient_insurance_id",
        String(patient_insurance_id)
      ),
      body
    );
    return response.data;
  }

  // DELETE /patient/insurance/:patient_insurance_id
  static async deletePatientInsurance(
    patient_insurance_id: number
  ): Promise<ApiResponse<null>> {
    const response = await api.delete(
      EndPoints.patientInsurance.delete.replace(
        ":patient_insurance_id",
        String(patient_insurance_id)
      )
    );
    return response.data;
  }
}

// Default export for flexibility
export default PatientInsuranceApi;
