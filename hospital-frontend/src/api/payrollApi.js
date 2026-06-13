import axiosInstance from './axiosConfig';

export const generatePayroll = (staffId, month, year) =>
  axiosInstance.post(`/api/payroll/generate/${staffId}?month=${month}&year=${year}`);
export const getMonthlyPayroll = (month, year) =>
  axiosInstance.get(`/api/payroll/month?month=${month}&year=${year}`);
export const getStaffPayrollHistory = (staffId) =>
  axiosInstance.get(`/api/payroll/staff/${staffId}/history`);
export const markPayrollPaid = (payrollId) =>
  axiosInstance.put(`/api/payroll/${payrollId}/mark-paid`);
export const downloadPayslip = (payrollId) =>
  axiosInstance.get(`/api/payroll/${payrollId}/payslip`, { responseType: 'blob' });
