import { useMemo } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import useSimulations from '../../hooks/useSimulations';
import useNodes from '../../hooks/useNodes';
import SimulationTable from './SimulationTable';
import type { Simulation } from '../../types/Simulation';
import type { Node } from '../../types/Node';

export default function SimulationPage() {
  const { simulations, loading, error, fetchSimulations, deleteSimulation } = useSimulations();
  const { nodes } = useNodes();

  const nodesById = useMemo<Record<number, Node>>(() => {
    const map: Record<number, Node> = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  const handleDelete = async (sim: Simulation) => {
    const srcName = nodesById[sim.sourceNodeId]?.name ?? `#${sim.sourceNodeId}`;
    const dstName = nodesById[sim.destinationNodeId]?.name ?? `#${sim.destinationNodeId}`;
    const ok = window.confirm(
      `Delete simulation #${sim.id} (${srcName} → ${dstName})?`,
    );
    if (!ok) return;
    await deleteSimulation(sim.id);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            Simulations
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            History of all routing algorithm runs
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Summary badge */}
          {simulations.length > 0 && (
            <Typography variant="body2" sx={{ color: '#475569' }}>
              {simulations.length} record{simulations.length !== 1 ? 's' : ''}
            </Typography>
          )}
          <Button
            startIcon={
              loading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />
            }
            onClick={fetchSimulations}
            disabled={loading}
            variant="outlined"
            size="small"
            sx={{
              color: '#94a3b8',
              borderColor: '#334155',
              '&:hover': { borderColor: '#3b82f6', color: '#3b82f6' },
            }}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* Error state */}
      {error && !loading && (
        <Alert
          severity="error"
          sx={{ mb: 3, bgcolor: '#450a0a', color: '#fca5a5', '& .MuiAlert-icon': { color: '#ef4444' } }}
          action={
            <Button color="inherit" size="small" onClick={fetchSimulations}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Table */}
      <SimulationTable
        simulations={simulations}
        nodesById={nodesById}
        onDelete={handleDelete}
        loading={loading}
      />
    </Box>
  );
}
