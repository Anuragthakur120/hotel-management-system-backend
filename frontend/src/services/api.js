import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_SERVER_URL ||
    'https://hotel-management-system-backend-slt.vercel.app/api',
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