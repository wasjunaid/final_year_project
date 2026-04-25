// src/services/insuranceService.js
import api from '../config/api';

export const insuranceService = {
  getAllInsurances: async () => {
    const response = await api.get('/insurance');
    return response.data;
  },

  createInsurance: async (insuranceData) => {
    const response = await api.post('/insurance', insuranceData);
    return response.data;
  },

  updateInsurance: async (insuranceNumber, insuranceData) => {
    const response = await api.put(`/insurance/${insuranceNumber}`, insuranceData);
    return response.data;
  },

  manualAutoRenewInsurance: async (insuranceNumber) => {
    const response = await api.put(`/insurance/${insuranceNumber}/manual-auto-renew`);
    return response.data;
  },

  deleteInsurance: async (insuranceNumber) => {
    const response = await api.delete(`/insurance/${insuranceNumber}`);
    return response.data;
  },

  // Insurance Company endpoints
  getAllInsuranceCompanies: async () => {
    const response = await api.get('/insurance-company');
    return response.data;
  },

  createInsuranceCompany: async (companyData) => {
    const response = await api.post('/insurance-company', companyData);
    return response.data;
  },

  updateInsuranceCompany: async (companyId, companyData) => {
    const response = await api.put(`/insurance-company/${companyId}`, companyData);
    return response.data;
  },

  deleteInsuranceCompany: async (companyId) => {
    const response = await api.delete(`/insurance-company/${companyId}`);
    return response.data;
  },

  // Insurance Plan endpoints
  getAllInsurancePlans: async () => {
    const response = await api.get('/insurance-plan');
    return response.data;
  },

  createInsurancePlan: async (planData) => {
    const response = await api.post('/insurance-plan', planData);
    return response.data;
  },

  updateInsurancePlan: async (planId, planData) => {
    const response = await api.put(`/insurance-plan/${planId}`, planData);
    return response.data;
  },

  deleteInsurancePlan: async (planId) => {
    const response = await api.delete(`/insurance-plan/${planId}`);
    return response.data;
  },

  // Insurance Staff endpoints
  getAllInsuranceStaff: async () => {
    const response = await api.get('/insurance-staff');
    return response.data;
  },

  getInsuranceStaffForSuperAdmin: async () => {
    const response = await api.get('/insurance-staff/super-admin');
    return response.data;
  },

  createInsuranceStaff: async (staffData) => {
    const response = await api.post('/insurance-staff', staffData);
    return response.data;
  },

  deleteInsuranceStaff: async (staffId) => {
    const response = await api.delete(`/insurance-staff/${staffId}`);
    return response.data;
  },

  // Verify Insurance (public endpoint)
  verifyInsurance: async (verificationData) => {
    const response = await api.post('/verify-insurance', verificationData);
    return response.data;
  },

  // Insurance Panel List endpoints
  getInsurancePanelList: async () => {
    const response = await api.get('/insurance-panel-list');
    return response.data;
  },

  createInsurancePanelList: async (panelData) => {
    const response = await api.post('/insurance-panel-list', panelData);
    return response.data;
  },

  deleteInsurancePanelList: async (panelListId) => {
    const response = await api.delete(`/insurance-panel-list/${panelListId}`);
    return response.data;
  },
};