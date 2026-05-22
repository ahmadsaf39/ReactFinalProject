import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import type { Simulation } from '../../types/Simulation';
import type { Node } from '../../types/Node';
import { formatCost } from '../../utils/formatCost';
import { formatMs } from '../../utils/formatMs';

interface Props {
  simulations: Simulation[];
  nodesById: Record<number, Node>;
  onDelete: (simulation: Simulation) => void;
  loading: boolean;
}

const resolveName = (nodesById: Record<number, Node>, id: number): string =>
  nodesById[id]?.name ?? `#${id}`;

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SimulationTable({ simulations, nodesById, onDelete, loading }: Props) {
  if (simulations.length === 0) {
    return (
      <Paper sx={{ bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
            No simulations yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#334155' }}>
            Run a routing algorithm to see history here.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: '#0f172a', color: '#94a3b8', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #334155' } }}>
            <TableCell>#</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Algorithm</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Total Cost</TableCell>
            <TableCell>Exec Time</TableCell>
            <TableCell>Visited</TableCell>
            <TableCell>Hops</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {simulations.map((sim) => (
            <TableRow
              key={sim.id}
              hover
              sx={{
                '& td': { color: '#cbd5e1', borderBottom: '1px solid #1e293b', py: 1.5 },
                '&:hover td': { bgcolor: '#0f172a' },
              }}
            >
              <TableCell sx={{ color: '#475569 !important', fontSize: '0.75rem' }}>{sim.id}</TableCell>

              {/* Route: Source → Destination */}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>
                    {resolveName(nodesById, sim.sourceNodeId)}
                  </Typography>
                  <ArrowRightAltIcon sx={{ color: '#475569', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.8rem' }}>
                    {resolveName(nodesById, sim.destinationNodeId)}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={sim.algorithm}
                  size="small"
                  sx={{ bgcolor: '#1e3a5f', color: '#60a5fa', fontSize: '0.7rem', height: 20 }}
                />
              </TableCell>

              {/* Path found indicator */}
              <TableCell>
                {sim.pathFound ? (
                  <Tooltip title="Path found">
                    <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 18 }} />
                  </Tooltip>
                ) : (
                  <Tooltip title="No path">
                    <CancelOutlinedIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                  </Tooltip>
                )}
              </TableCell>

              <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {sim.pathFound ? formatCost(sim.totalCost) : '—'}
              </TableCell>

              <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMs(sim.executionTimeMs)}
              </TableCell>

              <TableCell>{sim.visitedNodes}</TableCell>

              <TableCell>
                {sim.pathFound ? sim.pathNodes.length : '—'}
              </TableCell>

              <TableCell sx={{ color: '#64748b !important', fontSize: '0.75rem' }}>
                {formatDate(sim.createdAt)}
              </TableCell>

              <TableCell align="right">
                <Tooltip title="Delete simulation">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(sim)}
                      disabled={loading}
                      sx={{ color: '#ef4444', '&:hover': { bgcolor: '#450a0a' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
