// src/services/api.js — Centralized API Client for Vemavaram Village CSP
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach JWT access token from localStorage (prefer worker token for worker endpoints)
api.interceptors.request.use(
  (config) => {
    const workerToken = localStorage.getItem('worker_access_token');
    const citizenToken = localStorage.getItem('citizen_access_token');

    if (config.url?.startsWith('/workers') && workerToken) {
      config.headers.Authorization = `Bearer ${workerToken}`;
    } else if (citizenToken) {
      config.headers.Authorization = `Bearer ${citizenToken}`;
    } else if (workerToken) {
      config.headers.Authorization = `Bearer ${workerToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiration and automatic refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('citizen_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );
          const newAccessToken = data.data.access_token;
          localStorage.setItem('citizen_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          // Token refresh failed: clear storage and notify app
          localStorage.removeItem('citizen_access_token');
          localStorage.removeItem('citizen_refresh_token');
          localStorage.removeItem('citizen_user');
          window.dispatchEvent(new Event('citizen_auth_expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract clean error message from API response
export const extractErrorMessage = (error) => {
  if (error.response?.data) {
    const data = error.response.data;
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.join('; ');
    }
    if (data.message) {
      return data.message;
    }
    if (data.error) {
      return data.error;
    }
  }
  if (error.message === 'Network Error') {
    return 'Unable to connect to the Vemavaram server. Please verify your connection or try again shortly.';
  }
  return error.message || 'An unexpected error occurred. Please try again.';
};

// ── Auth API ──────────────────────────────────────────────────
export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  workerLogin: (payload) => api.post('/auth/worker-login', payload),
  getMe: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  logout: () => {
    localStorage.removeItem('citizen_access_token');
    localStorage.removeItem('citizen_refresh_token');
    localStorage.removeItem('citizen_user');
    window.dispatchEvent(new Event('citizen_auth_changed'));
  },
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('citizen_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  isAuthenticated: () => !!localStorage.getItem('citizen_access_token'),
};

// ── Complaints API ───────────────────────────────────────────
export const complaintsApi = {
  getCategories: () => api.get('/complaints/categories'),
  // create supports FormData or JSON object
  create: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/complaints', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
  getMyComplaints: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  trackPublic: (id) => api.get(`/complaints/track/${id}`),
};

// ── Feedback API ─────────────────────────────────────────────
export const feedbackApi = {
  submit: (payload) => api.post('/feedback', payload),
  getByComplaintId: (complaintId) => api.get(`/feedback/${complaintId}`),
};

// ── Contact API ──────────────────────────────────────────────
export const contactApi = {
  submit: (payload) => api.post('/contact', payload),
};

// ── Public / Admin Stats API ─────────────────────────────────
export const publicApi = {
  getStats: () => api.get('/admin/public-stats'),
};

// ── Notifications API ────────────────────────────────────────
export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ── Worker Portal API ────────────────────────────────────────
export const workersApi = {
  getTasks: () => api.get('/workers/tasks'),
  updateProgress: (complaintId, data) => {
    const isFormData = data instanceof FormData;
    return api.put(`/workers/tasks/${complaintId}/progress`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
};

export default api;

