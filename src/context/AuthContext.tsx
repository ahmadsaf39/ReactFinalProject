import React, { createContext, useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';
import type { AuthResponse, LoginRequest, SignupRequest, User } from '../types/Auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login(data: LoginRequest): Promise<void>;
  signup(data: SignupRequest): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (data: LoginRequest) => {
    const response: AuthResponse = await authApi.login(data);
    tokenStorage.set(response.token);
    setUser(response.user);
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    const response: AuthResponse = await authApi.signup(data);
    tokenStorage.set(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, signup, logout }),
    [user, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
