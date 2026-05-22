import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../constants/apiRoutes';
import type { RoutingResult } from '../types/RoutingResult';

export const routingApi = {
  /**
   * Run Dijkstra algorithm between two nodes.
   * GET /api/Routing/dijkstra?sourceNodeId=X&destinationNodeId=Y
   * The result is also saved as a Simulation record by the backend.
   */
  dijkstra: (sourceNodeId: number, destinationNodeId: number) =>
    axiosInstance.get<RoutingResult>(API_ROUTES.routing.dijkstra, {
      params: { sourceNodeId, destinationNodeId },
    }),
};

export default routingApi;
