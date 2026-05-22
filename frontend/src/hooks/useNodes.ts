import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import nodesApi from '../api/nodesApi';
import type { Node, NodePayload } from '../types/Node';

const extractError = (err: unknown, fallback: string): string => {
	if (err instanceof AxiosError) {
		const data = err.response?.data as
			| { title?: string; message?: string; errors?: Record<string, string[]> }
			| string
			| undefined;
		if (typeof data === 'string') return data;
		if (data?.errors) {
			const firstKey = Object.keys(data.errors)[0];
			if (firstKey && data.errors[firstKey]?.[0]) return data.errors[firstKey][0];
		}
		if (data?.message) return data.message;
		if (data?.title) return data.title;
	}
	return fallback;
};

export const useNodes = () => {
	const [nodes, setNodes] = useState<Node[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchNodes = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await nodesApi.getAll();
			setNodes(res.data);
		} catch (err) {
			const msg = extractError(err, 'Failed to load nodes');
			console.error('[useNodes] fetch failed:', err);
			setError(msg);
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	const createNode = useCallback(
		async (data: NodePayload) => {
			setLoading(true);
			try {
				console.log('[useNodes] POST payload:', data);
				const res = await nodesApi.create(data);
				setNodes((prev) => [...prev, res.data]);
				toast.success('Node created');
			} catch (err) {
				const msg = extractError(err, 'Failed to create node');
				console.error('[useNodes] create failed:', err);
				toast.error(msg);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const updateNode = useCallback(
		async (id: number, data: NodePayload) => {
			setLoading(true);
			try {
				const body: Node = { id, ...data };
				console.log('[useNodes] PUT payload:', body);
				await nodesApi.update(id, body);
				setNodes((prev) =>
					prev.map((n) => (n.id === id ? { ...n, ...data } : n)),
				);
				toast.success('Node updated');
			} catch (err) {
				const msg = extractError(err, 'Failed to update node');
				console.error('[useNodes] update failed:', err);
				toast.error(msg);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const deleteNode = useCallback(async (id: number) => {
		setLoading(true);
		try {
			await nodesApi.delete(id);
			setNodes((prev) => prev.filter((n) => n.id !== id));
			toast.success('Node deleted');
		} catch (err) {
			const msg = extractError(err, 'Failed to delete node');
			console.error('[useNodes] delete failed:', err);
			toast.error(msg);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchNodes();
	}, [fetchNodes]);

	return {
		nodes,
		loading,
		error,
		fetchNodes,
		createNode,
		updateNode,
		deleteNode,
	};
};

export default useNodes;
