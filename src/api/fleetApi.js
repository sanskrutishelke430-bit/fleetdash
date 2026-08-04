import axios from 'axios';

// Create Axios Instance with default settings
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response Interceptor for global error handling & logging
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Server connection error. Please try again.';
    console.error(`[API Error Interceptor]: ${message}`);
    return Promise.reject(new Error(message));
  }
);

export const vehicleApi = {
  getVehicles: (params) => api.get('/vehicles', { params }),
  getVehicleById: (id) => api.get(`/vehicles/${id}`),
  createVehicle: (data) => api.post('/vehicles', data),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
};

export const telemetryApi = {
  getTelemetry: (params) => api.get('/telemetry', { params }),
  createTelemetry: (data) => api.post('/telemetry', data),
};

export default api;
