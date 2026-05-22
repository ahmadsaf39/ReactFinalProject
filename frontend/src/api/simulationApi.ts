import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../constants/apiRoutes';
import type { Simulation } from '../types/Simulation';

export const simulationApi = {
  /** GET /api/Simulation — returns all simulations ordered by most recent */
  getAll: () => axiosInstance.get<Simulation[]>(API_ROUTES.simulations),

  /** GET /api/Simulation/{id} */
  getById: (id: number) =>
    axiosInstance.get<Simulation>(`${API_ROUTES.simulations}/${id}`),

  /** DELETE /api/Simulation/{id} */
  delete: (id: number) =>
    axiosInstance.delete<void>(`${API_ROUTES.simulations}/${id}`),
};

export default simulationApi;
