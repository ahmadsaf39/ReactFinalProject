import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import linksApi from '../api/linksApi';
import type { Link, LinkPayload } from '../types/Link';

const extractError = (err: unknown, fallback: string): string => {
	if (err instanceof AxiosError) {
		const data = err.response?.data as
			| { title?: string; message?: string; errors?: Record<string, string[]>; error?: string; detail?: string }
			| string
			| undefined;
		if (typeof data === 'string') return data;
		if (data?.errors) {
			const firstKey = Object.keys(data.errors)[0];
			if (firstKey && data.errors[firstKey]?.[0]) return data.errors[firstKey][0];
		}
		if (data?.detail) return data.detail;
		if (data?.error) return data.error;
		if (data?.message) return data.message;
		if (data?.title) return data.title;
	}
	return fallback;
};

export const useLinks = () => {
	const [links, setLinks] = useState<Link[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchLinks = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await linksApi.getAll();
			setLinks(res.data);
		} catch (err) {
			const msg = extractError(err, 'Failed to load links');
			console.error('[useLinks] fetch failed:', err);
			setError(msg);
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	const createLink = useCallback(async (data: LinkPayload) => {
		setLoading(true);
		try {
			console.log('[useLinks] POST payload:', data);
			const res = await linksApi.create(data);
			setLinks((prev) => [...prev, res.data]);
			toast.success('Link created');
		} catch (err) {
			const msg = extractError(err, 'Failed to create link');
			console.error('[useLinks] create failed:', err);
			toast.error(msg);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const updateLink = useCallback(async (id: number, data: LinkPayload) => {
		setLoading(true);
		try {
			const body: Link = { id, ...data };
			console.log('[useLinks] PUT payload:', body);
			await linksApi.update(id, body);
			setLinks((prev) =>
				prev.map((l) => (l.id === id ? { ...l, ...data } : l)),
			);
			toast.success('Link updated');
		} catch (err) {
			const msg = extractError(err, 'Failed to update link');
			console.error('[useLinks] update failed:', err);
			toast.error(msg);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteLink = useCallback(async (id: number) => {
		setLoading(true);
		try {
			await linksApi.delete(id);
			setLinks((prev) => prev.filter((l) => l.id !== id));
			toast.success('Link deleted');
		} catch (err) {
			const msg = extractError(err, 'Failed to delete link');
			console.error('[useLinks] delete failed:', err);
			toast.error(msg);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchLinks();
	}, [fetchLinks]);

	return {
		links,
		loading,
		error,
		fetchLinks,
		createLink,
		updateLink,
		deleteLink,
	};
};

export default useLinks;
