import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';

export interface DashboardSummaryDto {
  scope: 'system' | 'hospital' | 'doctor';
  hospital_id?: number | null;
  doctor_id?: number | null;
  totalAppointments?: number;
  appointmentsByStatus?: Record<string, number>;
  totalHospitals?: number;
  totalInsuranceCompanies?: number;
  totalPatients?: number;
  totalDoctors?: number;
  totalHospitalStaff?: number;
  totalClaims?: number;
  claimsByStatus?: Record<string, number>;
  totalEhrAccessRequests?: number;
  ehrAccessByStatus?: Record<string, number>;
  totalSystemSubAdmins?: number;
  activeSystemSubAdmins?: number;
  deactivatedSystemSubAdmins?: number;
  verifiedSystemSubAdmins?: number;
  pendingSystemSubAdmins?: number;
  totalHospitalAdmins?: number;
  activeHospitalAdmins?: number;
  deactivatedHospitalAdmins?: number;
  verifiedHospitalAdmins?: number;
  pendingHospitalAdmins?: number;
}

export const dashboardStatsService = {
  async getSummary(): Promise<ApiResponse<DashboardSummaryDto>> {
    const response = await apiClient.get<ApiResponse<DashboardSummaryDto>>('/dashboard-stats/summary');
    return response.data;
  },
};
