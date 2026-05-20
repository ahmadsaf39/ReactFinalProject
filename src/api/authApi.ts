import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../constants/apiRoutes';
import { LoginRequest, SignupRequest, AuthResponse, User } from '../types/Auth';

export const authApi = {
  login:  (data: LoginRequest)  => axiosInstance.post<AuthResponse>(API_ROUTES.auth.login, data),
  signup: (data: SignupRequest) => axiosInstance.post<AuthResponse>(API_ROUTES.auth.signup, data),
  logout: ()                    => axiosInstance.post(API_ROUTES.auth.logout),
  me:     ()                    => axiosInstance.get<User>(API_ROUTES.auth.me),
};
