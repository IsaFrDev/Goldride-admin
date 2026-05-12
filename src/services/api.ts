import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000/api/`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adjacently adding interceptor for JWT if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/login/');
    
    if (error.response?.status === 401 && !isLoginRequest) {
      // Just clear token, let App.tsx or other components catch the 401 and handle it natively
      localStorage.removeItem('token');
      // No reload here to prevent infinite loop
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (credentials: any) => api.post('auth/admin/login/', credentials),
  getStats: () => api.get('rides/admin/dashboard-stats/'),
  getUsers: () => api.get('auth/admin/users/'),
  createUser: (data: any) => api.post('auth/admin/users/', data),
  updateUser: (id: number, data: any) => api.put(`auth/admin/users/${id}/`, data),
  deleteUser: (id: number) => api.delete(`auth/admin/users/${id}/`),
  
  getDrivers: () => api.get('auth/admin/drivers/'),
  createDriver: (data: any) => api.post('auth/admin/drivers/', data),
  updateDriver: (id: number, data: any) => api.put(`auth/admin/drivers/${id}/`, data),
  deleteDriver: (id: number) => api.delete(`auth/admin/drivers/${id}/`),
  
  getRides: () => api.get('rides/admin/rides/'),
  getSettings: () => api.get('pricing/admin/settings/'),
  updateSettings: (data: any) => api.post('pricing/admin/settings/', data),
  getAnalytics: () => api.get('rides/admin/analytics/'),
  approveDriver: (id: number) => api.post(`auth/admin/drivers/${id}/action/`, { action: 'approve' }),
  rejectDriver: (id: number) => api.post(`auth/admin/drivers/${id}/action/`), 
  userAction: (id: number, action: string) => api.post(`auth/admin/users/${id}/action/`, { action }),
  driverAction: (id: number, action: string) => api.post(`auth/admin/drivers/${id}/action/`, { action }),
  dispatchExternal: (requestId: number, provider: string, externalId: string, etaMinutes?: number) => 
    api.post(`rides/admin/requests/${requestId}/dispatch-external/`, { provider, external_order_id: externalId, eta_minutes: etaMinutes }),
  externalArrived: (requestId: number) =>
    api.post(`rides/admin/requests/${requestId}/external-arrived/`),
  updateExternalEta: (requestId: number, etaMinutes: number) =>
    api.post(`rides/admin/requests/${requestId}/update-eta/`, { eta_minutes: etaMinutes }),
  
  cancelRide: (id: number) => api.post(`rides/admin/rides/${id}/cancel/`),
  deleteRide: (id: number) => api.delete(`rides/admin/rides/${id}/`),
  cancelRequest: (id: number) => api.post(`rides/admin/requests/${id}/cancel/`),
  deleteRequest: (id: number) => api.delete(`rides/admin/requests/${id}/`),
};

export default api;
