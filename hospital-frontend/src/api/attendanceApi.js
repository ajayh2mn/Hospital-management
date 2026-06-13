import axiosInstance from './axiosConfig';

export const markAttendance = (data) => axiosInstance.post('/api/attendance', data);
export const updateAttendance = (id, data) => axiosInstance.put(`/api/attendance/${id}`, data);
export const getAttendanceByDate = (date) => axiosInstance.get(`/api/attendance/date/${date}`);
export const getStaffAttendance = (staffId, from, to) =>
  axiosInstance.get(`/api/attendance/staff/${staffId}?from=${from}&to=${to}`);
export const getMonthlySummary = (staffId, month, year) =>
  axiosInstance.get(`/api/attendance/staff/${staffId}/monthly-summary?month=${month}&year=${year}`);
export const bulkMarkAttendance = (date, status) =>
  axiosInstance.post(`/api/attendance/bulk-mark?date=${date}&status=${status}`);
