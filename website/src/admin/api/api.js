// src/admin/api/api.js — Axios API client for Vemavaram Village CSP Admin Dashboard
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://vemavaram-backend-api.onrender.com/api'

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 })

// Attach JWT from localStorage
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('admin_access_token') || localStorage.getItem('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('admin_refresh_token') || localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`,
            {}, { headers: { Authorization: `Bearer ${refresh}` } })
          const newToken = data.data.access_token
          localStorage.setItem('admin_access_token', newToken)
          localStorage.setItem('access_token', newToken)
          err.config.headers.Authorization = `Bearer ${newToken}`
          return api.request(err.config)
        } catch {
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('access_token')
          localStorage.removeItem('admin_refresh_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('admin_user')
          window.location.href = '/admin/login'
        }
      } else {
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('access_token')
        localStorage.removeItem('admin_refresh_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  adminLogin: (identifier, password) => {
    const isEmail = String(identifier).includes('@')
    const payload = isEmail
      ? { email: identifier.trim(), password }
      : { mobile: identifier.trim().replace(/\D/g, ''), password }
    return api.post('/auth/admin-login', payload)
  },
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

export const complaintsApi = {
  getAll: (params) => api.get('/admin/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, status, notes) =>
    api.put(`/admin/complaints/${id}/status`, { status, notes }),
  assign: (id, worker_id, notes, expected_date) =>
    api.post(`/admin/complaints/${id}/assign`, { worker_id, notes, expected_date }),
  getCategories: () => api.get('/complaints/categories'),
}

export const residentVerificationApi = {
  getRequests: (params) => api.get('/admin/resident-verification/requests', { params }),
  approveRequest: (requestId, remarks) => api.put(`/admin/resident-verification/${requestId}/approve`, { remarks }),
  rejectRequest: (requestId, remarks) => api.put(`/admin/resident-verification/${requestId}/reject`, { remarks }),
  getCodes: (params) => api.get('/admin/resident-verification/codes', { params }),
  generateCodes: (data) => api.post('/admin/resident-verification/codes', data),
  getStats: () => api.get('/admin/resident-verification/stats'),
}

export const workersApi = {
  getAll: (params) => api.get('/workers', { params }),
  create: (data) => api.post('/workers', data),
  update: (id, d) => api.put(`/workers/${id}`, d),
}

export const analyticsApi = {
  getDashboard: () => api.get('/admin/analytics'),
  getSurvey: () => api.get('/admin/survey-insights'),
  getReport: (p) => api.get('/admin/reports', { params: p }),
  getWardStats: () => api.get('/analytics_v2/ward_stats'),
  getGisMap: () => api.get('/analytics_v2/gis_map'),
}

export const feedbackApi = {
  getSummary: () => api.get('/feedback/summary'),
}

export const assetsApi = {
  getAll: () => api.get('/assets'),
  create: (data) => api.post('/assets', data),
}

export const contactApi = {
  getAll: (params) => api.get('/contact', { params }),
}

export default api
