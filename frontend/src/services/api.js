import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return import.meta.env.VITE_LOCAL_SERVER_URL || 'http://localhost:5000/api';
  }
  return import.meta.env.VITE_SERVER_URL || 'https://hotel-management-system-backend-slt.vercel.app/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

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

export default api;