import axiosInstance from './axiosConfig';

export const getMyProfile      = ()           => axiosInstance.get('/api/staff/me');
export const getMyAttendance   = (from, to)   => axiosInstance.get(`/api/attendance/me?from=${from}&to=${to}`);
export const getMyMonthlySummary = (month, year) => axiosInstance.get(`/api/attendance/me/monthly-summary?month=${month}&year=${year}`);
export const markMyAttendance  = (data)       => axiosInstance.post('/api/attendance/me/mark', data);
export const getMyPayrollHistory = ()         => axiosInstance.get('/api/payroll/me/history');
export const downloadMyPayslip = (id)         => axiosInstance.get(`/api/payroll/${id}/payslip`, { responseType: 'blob' });
export const getHospitalLocation = ()         => axiosInstance.get('/api/settings/hospital-location');
export const startMySession    = (data)       => axiosInstance.post('/api/attendance/me/session/start', data);
export const endMySession      = (data)       => axiosInstance.post('/api/attendance/me/session/end', data);
export const getMyTodaySession = ()           => axiosInstance.get('/api/attendance/me/session/today');
