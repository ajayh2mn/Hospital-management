import axiosInstance from './axiosConfig';

export const createTicket = (data) => axiosInstance.post('/api/tickets', data);
export const getAllTickets = () => axiosInstance.get('/api/tickets');
export const getMyTickets = () => axiosInstance.get('/api/tickets/my-tickets');
export const addComment = (id, comment) =>
  axiosInstance.post(`/api/tickets/${id}/comments?comment=${encodeURIComponent(comment)}`);
export const updateTicketStatus = (id, status, resolution) =>
  axiosInstance.patch(`/api/tickets/${id}/status?status=${status}${resolution ? `&resolution=${encodeURIComponent(resolution)}` : ''}`);
export const getDashboardStats = () => axiosInstance.get('/api/admin/dashboard');
