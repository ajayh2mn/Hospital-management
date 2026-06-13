import axiosInstance from './axiosConfig';

export const getDoctorQueue = (doctorId, date) =>
  axiosInstance.get(`/api/queue/doctor/${doctorId}${date ? `?date=${date}` : ''}`);
export const getWaitingQueue = () => axiosInstance.get('/api/queue/waiting');
export const callPatient = (id) => axiosInstance.put(`/api/queue/${id}/call`);
export const completeConsultation = (id) => axiosInstance.put(`/api/queue/${id}/complete`);
export const skipPatient = (id) => axiosInstance.put(`/api/queue/${id}/skip`);
