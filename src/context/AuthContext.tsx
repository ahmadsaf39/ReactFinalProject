import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';
import type { AuthContextType, LoginRequest, SignupRequest } from '../types/Auth';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (tokenStorage.get()) {
        try {
          const response = await authApi.me();
          setUser(response.data);
        } catch {
          tokenStorage.clear();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    tokenStorage.set(response.data.token);
    tokenStorage.setRefreshToken(response.data.refreshToken);
    setUser({
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      isAdmin: response.data.isAdmin,
    });
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    const response = await authApi.signup(data);
    tokenStorage.set(response.data.token);
    tokenStorage.setRefreshToken(response.data.refreshToken);
    setUser({
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      isAdmin: response.data.isAdmin,
    });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    tokenStorage.clear();
    tokenStorage.clearRefreshToken();
    setUser(null);
  }, []);

  const value: AuthContextType = useMemo(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
