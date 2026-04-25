import { CNIC_REGEX, CNIC_HYPHENATED_REGEX } from '../constants/roles';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCNIC = (cnic) => {
  // Remove hyphens for validation
  const cleanCNIC = cnic.replace(/-/g, '');
  return CNIC_REGEX.test(cleanCNIC);
};

export const formatCNIC = (cnic) => {
  // Remove any existing hyphens
  const cleanCNIC = cnic.replace(/-/g, '');
  
  // Format as XXXXX-XXXXXXX-X
  if (cleanCNIC.length === 13) {
    return `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5, 12)}-${cleanCNIC.slice(12)}`;
  }
  
  return cnic;
};

export const validateInsuranceNumber = (insuranceNumber) => {
  return insuranceNumber && insuranceNumber.length >= 9 && insuranceNumber.length <= 13;
};