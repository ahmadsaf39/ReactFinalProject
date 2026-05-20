import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import nodesApi from '../api/nodesApi';
import type { Node } from '../types/Node';

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
      setError('Failed to load nodes');
      toast.error('Failed to load nodes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNode = useCallback(async (data: Omit<Node, 'id'>) => {
    setLoading(true);
    try {
      await nodesApi.create(data);
      toast.success('Node created');
      await fetchNodes();
    } catch (err) {
      toast.error('Failed to create node');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNodes]);

  const updateNode = useCallback(async (id: number, data: Omit<Node, 'id'>) => {
    setLoading(true);
    try {
      await nodesApi.update(id, data);
      toast.success('Node updated');
      await fetchNodes();
    } catch (err) {
      toast.error('Failed to update node');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNodes]);

  const deleteNode = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await nodesApi.delete(id);
      toast.success('Node deleted');
      setNodes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error('Failed to delete node');
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

