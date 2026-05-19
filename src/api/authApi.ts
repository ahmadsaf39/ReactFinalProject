import type { LoginRequest, SignupRequest, AuthResponse, User } from '../types/Auth';

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return Promise.resolve({
      token: 'fake-token',
      user: {
        id: '1',
        name: 'Demo User',
        email: data.email,
      },
    });
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return Promise.resolve({
      token: 'fake-token',
      user: {
        id: '1',
        name: data.name,
        email: data.email,
      },
    });
  },

  async logout(): Promise<void> {
    return Promise.resolve();
  },

  async getCurrentUser(): Promise<User | null> {
    return Promise.resolve({
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
    });
  },
};
