import axiosInstance from './axiosConfig';

export const bookAppointment = (data) => axiosInstance.post('/api/appointments', data);
export const getTodayAppointments = () => axiosInstance.get('/api/appointments/today');
export const getDoctorAppointments = (doctorId) => axiosInstance.get(`/api/appointments/doctor/${doctorId}`);
export const getPatientAppointments = (patientId) => axiosInstance.get(`/api/appointments/patient/${patientId}`);
export const checkInPatient = (id) => axiosInstance.post(`/api/appointments/${id}/check-in`);
export const updateAppointmentStatus = (id, status) =>
  axiosInstance.patch(`/api/appointments/${id}/status?status=${status}`);
