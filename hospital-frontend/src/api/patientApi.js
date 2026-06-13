import axiosInstance from './axiosConfig';

export const getAllPatients = () => axiosInstance.get('/api/patients');
export const getPatientById = (id) => axiosInstance.get(`/api/patients/${id}`);
export const registerPatient = (data) => axiosInstance.post('/api/patients', data);
export const updatePatient = (id, data) => axiosInstance.put(`/api/patients/${id}`, data);
export const searchPatients = (keyword) => axiosInstance.get(`/api/patients/search?keyword=${keyword}`);
