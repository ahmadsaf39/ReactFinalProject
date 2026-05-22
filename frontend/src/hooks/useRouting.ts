import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import routingApi from '../api/routingApi';
import type { RoutingResult } from '../types/RoutingResult';

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

export interface UseRoutingReturn {
  result: RoutingResult | null;
  loading: boolean;
  error: string | null;
  runDijkstra: (sourceNodeId: number, destinationNodeId: number) => Promise<void>;
  clearResult: () => void;
}

export const useRouting = (): UseRoutingReturn => {
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDijkstra = useCallback(
    async (sourceNodeId: number, destinationNodeId: number) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await routingApi.dijkstra(sourceNodeId, destinationNodeId);
        setResult(res.data);

        if (res.data.pathFound) {
          toast.success(
            `Path found! ${res.data.pathNodeIds.length} hops, cost: ${res.data.totalCost} m`,
          );
        } else {
          toast.error('No path exists between the selected nodes.');
        }
      } catch (err) {
        const msg = extractError(err, 'Failed to run routing algorithm');
        console.error('[useRouting] dijkstra failed:', err);
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, runDijkstra, clearResult };
};

export default useRouting;
