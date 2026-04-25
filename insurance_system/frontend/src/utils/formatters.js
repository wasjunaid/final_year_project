import { format, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '-';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr);
  } catch (error) {
    return '-';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatCurrency = (amount, currency = 'PKR') => {
  if (!amount && amount !== 0) return '-';
  return `${currency} ${Number(amount).toLocaleString()}`;
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatCNICDisplay = (cnic) => {
  if (!cnic) return '-';
  const cleanCNIC = cnic.replace(/-/g, '');
  if (cleanCNIC.length === 13) {
    return `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5, 12)}-${cleanCNIC.slice(12)}`;
  }
  return cnic;
};