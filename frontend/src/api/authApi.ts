import axios from 'axios';
import axiosInstance from './axiosInstance';
import { API_BASE_URL, API_ROUTES } from '../constants/apiRoutes';
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  User,
} from '../types/Auth';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<AuthResponse>(API_ROUTES.auth.login, data),

  signup: (data: SignupRequest) =>
    axiosInstance.post<AuthResponse>(API_ROUTES.auth.signup, data),

  refreshToken: (refreshToken: string) =>
    axios.post<AuthResponse>(
      `${API_BASE_URL}${API_ROUTES.auth.refreshToken}`,
      JSON.stringify(refreshToken),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),

  // JWT logout does not require a backend request.
  // We simply remove the token from localStorage in AuthContext.
  logout: async () => Promise.resolve(),

  me: () =>
    axiosInstance.get<User>(API_ROUTES.auth.me),
};