export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem('auth_token');
  },

  set(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  clear(): void {
    localStorage.removeItem('auth_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem('refresh_token', refreshToken);
  },

  clearRefreshToken(): void {
    localStorage.removeItem('refresh_token');
  },
};
