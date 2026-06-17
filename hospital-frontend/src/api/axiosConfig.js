/**
 * axiosConfig.js — configures a shared Axios instance for all API calls.
 *
 * Why a shared instance?
 * - One place to set the base URL (http://localhost:8080)
 * - Interceptors automatically attach the JWT token to every request
 * - Interceptors automatically handle 401 errors (token expired → redirect to login)
 *
 * Interceptors are like middleware for HTTP requests:
 *   Request interceptor: runs BEFORE every request is sent
 *   Response interceptor: runs AFTER every response is received
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create a pre-configured axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000, // 10 seconds timeout
});

// ============ REQUEST INTERCEPTOR ============
// Runs before every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============ RESPONSE INTERCEPTOR ============
// Runs after every response
axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses through

  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      // User doesn't have permission — could show a toast message
      console.error('Access denied');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
