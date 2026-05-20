export const API_BASE_URL = 'http://localhost:5000';

export const API_ROUTES = {
  auth: {
    login:  '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    me:     '/api/auth/me',
  },
  nodes:       '/api/nodes',
  links:       '/api/links',
  routing: {
    dijkstra:  '/api/routing/dijkstra',
  },
  simulations: '/api/simulation',
  dashboard:   '/api/dashboard',
} as const;
