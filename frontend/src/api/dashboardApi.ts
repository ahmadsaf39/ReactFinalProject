import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../constants/apiRoutes';

export interface DashboardStats {
  totalNodes: number;
  totalLinks: number;
  totalSimulations: number;
  activeNodes: number;
  inactiveNodes: number;
  averageLinkCost: number;
}

export const dashboardApi = {
  /** GET /api/Dashboard */
  getStats: () => axiosInstance.get<DashboardStats>(API_ROUTES.dashboard),
};

export default dashboardApi;
