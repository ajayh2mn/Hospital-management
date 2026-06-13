/**
 * authApi.js — API calls for login and registration.
 *
 * Each function calls one backend endpoint.
 * The frontend components import these functions — they never use axios directly.
 * This separation means if the API changes, you only update this file.
 */

import axiosInstance from './axiosConfig';

export const loginApi = (credentials) =>
  axiosInstance.post('/api/auth/login', credentials);

export const registerApi = (userData) =>
  axiosInstance.post('/api/auth/register', userData);
