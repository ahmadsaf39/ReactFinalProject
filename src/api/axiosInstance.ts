import axios from 'axios';
import { API_BASE_URL } from '../constants/apiRoutes';
import { tokenStorage } from '../utils/tokenStorage';

const axiosInstance = axios.create({ baseURL: API_BASE_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
