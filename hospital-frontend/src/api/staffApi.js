import axiosInstance from './axiosConfig';

export const getAllStaff = () => axiosInstance.get('/api/staff');
export const getStaffById = (id) => axiosInstance.get(`/api/staff/${id}`);
export const createStaff = (data) => axiosInstance.post('/api/staff', data);
export const updateStaff = (id, data) => axiosInstance.put(`/api/staff/${id}`, data);
export const deleteStaff = (id) => axiosInstance.delete(`/api/staff/${id}`);
export const searchStaff = (keyword) => axiosInstance.get(`/api/staff/search?keyword=${keyword}`);
