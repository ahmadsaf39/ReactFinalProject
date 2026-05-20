import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ROUTES } from '../constants/apiRoutes';
import { tokenStorage } from '../utils/tokenStorage';
import type { AuthResponse } from '../types/Auth';

const axiosInstance = axios.create({ baseURL: API_BASE_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      tokenStorage.clear();
      tokenStorage.clearRefreshToken();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await axios.post<AuthResponse>(
        `${API_BASE_URL}${API_ROUTES.auth.refreshToken}`,
        JSON.stringify(refreshToken),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      tokenStorage.set(refreshResponse.data.token);
      tokenStorage.setRefreshToken(refreshResponse.data.refreshToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
      } else {
        originalRequest.headers = {
          Authorization: `Bearer ${refreshResponse.data.token}`,
        };
      }

      return axiosInstance(originalRequest);
    } catch {
      tokenStorage.clear();
      tokenStorage.clearRefreshToken();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
