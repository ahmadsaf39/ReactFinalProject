import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../constants/apiRoutes';
import type { Node, NodePayload } from '../types/Node';

export const nodesApi = {
	getAll: () => axiosInstance.get<Node[]>(API_ROUTES.nodes),

	getById: (id: number) =>
		axiosInstance.get<Node>(`${API_ROUTES.nodes}/${id}`),

	create: (data: NodePayload) =>
		axiosInstance.post<Node>(API_ROUTES.nodes, data),

	update: (id: number, data: Node) =>
		axiosInstance.put<void>(`${API_ROUTES.nodes}/${id}`, data),

	delete: (id: number) =>
		axiosInstance.delete<void>(`${API_ROUTES.nodes}/${id}`),
};

export default nodesApi;
