import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import simulationApi from '../api/simulationApi';
import type { Simulation } from '../types/Simulation';

const extractError = (err: unknown, fallback: string): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | { title?: string; message?: string; error?: string }
      | string
      | undefined;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.title) return data.title;
  }
  return fallback;
};

export interface UseSimulationsReturn {
  simulations: Simulation[];
  loading: boolean;
  error: string | null;
  fetchSimulations: () => Promise<void>;
  deleteSimulation: (id: number) => Promise<void>;
}

export const useSimulations = (): UseSimulationsReturn => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await simulationApi.getAll();
      setSimulations(res.data);
    } catch (err) {
      const msg = extractError(err, 'Failed to load simulations');
      console.error('[useSimulations] fetch failed:', err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSimulation = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await simulationApi.delete(id);
      setSimulations((prev) => prev.filter((s) => s.id !== id));
      toast.success('Simulation deleted');
    } catch (err) {
      const msg = extractError(err, 'Failed to delete simulation');
      console.error('[useSimulations] delete failed:', err);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSimulations();
  }, [fetchSimulations]);

  return { simulations, loading, error, fetchSimulations, deleteSimulation };
};

export default useSimulations;
