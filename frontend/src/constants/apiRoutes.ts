export const API_BASE_URL = 'https://localhost:7161';

export const API_ROUTES = {
  auth: {
    login: '/api/Auth/login',
    signup: '/api/Auth/register',
    logout: '/api/Auth/logout',
    me: '/api/Auth/me',
    refreshToken: '/api/Auth/refresh-token',
  },
  nodes: '/api/Nodes',
  links: '/api/Links',
  routing: {
    dijkstra: '/api/Routing/dijkstra',
  },
  simulations: '/api/Simulation',
  dashboard: '/api/Dashboard',
} as const;