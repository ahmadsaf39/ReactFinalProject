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
};
