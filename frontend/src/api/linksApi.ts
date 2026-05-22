import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../constants/apiRoutes';
import type { Link, LinkPayload } from '../types/Link';

export const linksApi = {
	getAll: () => axiosInstance.get<Link[]>(API_ROUTES.links),

	getById: (id: number) =>
		axiosInstance.get<Link>(`${API_ROUTES.links}/${id}`),

	create: (data: LinkPayload) =>
		axiosInstance.post<Link>(API_ROUTES.links, data),

	update: (id: number, data: Link) =>
		axiosInstance.put<void>(`${API_ROUTES.links}/${id}`, data),

	delete: (id: number) =>
		axiosInstance.delete<void>(`${API_ROUTES.links}/${id}`),
};

export default linksApi;
