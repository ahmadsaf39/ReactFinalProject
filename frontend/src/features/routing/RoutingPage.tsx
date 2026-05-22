import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import useNodes from '../../hooks/useNodes';
import useRouting from '../../hooks/useRouting';
import PathResult from './PathResult';
import GraphCanvas from './GraphCanvas';

export default function RoutingPage() {
  const { nodes } = useNodes();
  const { result, loading, error, runDijkstra, clearResult } = useRouting();

  const [sourceId, setSourceId] = useState<number | ''>('');
  const [destinationId, setDestinationId] = useState<number | ''>('');

  const activeNodes = useMemo(() => nodes.filter((n) => n.isActive), [nodes]);

  const nodesById = useMemo<Record<number, (typeof nodes)[0]>>(() => {
    const map: Record<number, (typeof nodes)[0]> = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  const canRun =
    sourceId !== '' &&
    destinationId !== '' &&
    sourceId !== destinationId &&
    !loading;

  const handleRun = async () => {
    if (sourceId === '' || destinationId === '') return;
    await runDijkstra(Number(sourceId), Number(destinationId));
  };

  const handleClear = () => {
    setSourceId('');
    setDestinationId('');
    clearResult();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
          Routing
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
          Run Dijkstra&apos;s algorithm to find the shortest path between two nodes
        </Typography>
      </Box>

      {/* Control panel */}
      <Paper
        sx={{
          bgcolor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 2,
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
          Algorithm Configuration
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'flex-end',
          }}
        >
          {/* Source node selector */}
          <FormControl sx={{ minWidth: 200, flex: 1 }} size="small">
            <InputLabel sx={{ color: '#94a3b8' }}>Source Node</InputLabel>
            <Select
              value={sourceId}
              label="Source Node"
              onChange={(e) => {
                setSourceId(e.target.value as number | '');
                clearResult();
              }}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                '& .MuiSvgIcon-root': { color: '#94a3b8' },
              }}
            >
              {activeNodes.length === 0 && (
                <MenuItem value="" disabled>
                  No active nodes
                </MenuItem>
              )}
              {activeNodes.map((n) => (
                <MenuItem
                  key={n.id}
                  value={n.id}
                  disabled={n.id === destinationId}
                >
                  {n.name} (#{n.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Destination node selector */}
          <FormControl sx={{ minWidth: 200, flex: 1 }} size="small">
            <InputLabel sx={{ color: '#94a3b8' }}>Destination Node</InputLabel>
            <Select
              value={destinationId}
              label="Destination Node"
              onChange={(e) => {
                setDestinationId(e.target.value as number | '');
                clearResult();
              }}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                '& .MuiSvgIcon-root': { color: '#94a3b8' },
              }}
            >
              {activeNodes.length === 0 && (
                <MenuItem value="" disabled>
                  No active nodes
                </MenuItem>
              )}
              {activeNodes.map((n) => (
                <MenuItem
                  key={n.id}
                  value={n.id}
                  disabled={n.id === sourceId}
                >
                  {n.name} (#{n.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Algorithm badge (always Dijkstra for now) */}
          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel sx={{ color: '#94a3b8' }}>Algorithm</InputLabel>
            <Select
              value="dijkstra"
              label="Algorithm"
              disabled
              sx={{
                color: '#94a3b8',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
              }}
            >
              <MenuItem value="dijkstra">Dijkstra</MenuItem>
            </Select>
          </FormControl>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleRun}
              disabled={!canRun}
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' },
                '&:disabled': { bgcolor: '#1e3a5f', color: '#475569' },
                px: 3,
              }}
            >
              {loading ? 'Running…' : 'Run'}
            </Button>
            {(result !== null || sourceId !== '' || destinationId !== '') && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
                disabled={loading}
                sx={{ color: '#94a3b8', borderColor: '#334155', '&:hover': { borderColor: '#475569' } }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        {/* Validation hint */}
        {sourceId !== '' && destinationId !== '' && sourceId === destinationId && (
          <Alert severity="warning" sx={{ mt: 2, bgcolor: '#451a03', color: '#fbbf24' }}>
            Source and destination must be different nodes.
          </Alert>
        )}
        {activeNodes.length < 2 && (
          <Alert severity="info" sx={{ mt: 2, bgcolor: '#0c2340', color: '#7dd3fc' }}>
            You need at least 2 active nodes and a link between them to run routing.
          </Alert>
        )}
      </Paper>

      {/* Error from hook */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: '#450a0a', color: '#fca5a5' }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {result && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Path result details */}
          <PathResult result={result} nodesById={nodesById} />

          {/* Graph visualization — only when path found */}
          {result.pathFound && result.pathNodeIds.length > 0 && (
            <GraphCanvas nodes={nodes} result={result} nodesById={nodesById} />
          )}
        </Box>
      )}
    </Box>
  );
}
