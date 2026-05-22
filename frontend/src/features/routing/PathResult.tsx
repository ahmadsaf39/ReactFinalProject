import { Box, Chip, Divider, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import type { RoutingResult } from '../../types/RoutingResult';
import type { Node } from '../../types/Node';
import { formatCost } from '../../utils/formatCost';
import { formatMs } from '../../utils/formatMs';

interface Props {
  result: RoutingResult;
  nodesById: Record<number, Node>;
}

interface MetricRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function MetricRow({ label, value, highlight }: MetricRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.25,
        px: 2,
        borderRadius: 1,
        bgcolor: highlight ? '#1e3a5f' : 'transparent',
        '&:not(:last-child)': { borderBottom: '1px solid #1e293b' },
      }}
    >
      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: highlight ? '#60a5fa' : 'white', fontWeight: highlight ? 700 : 400 }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function PathResult({ result, nodesById }: Props) {
  const resolveName = (id: number) => nodesById[id]?.name ?? `#${id}`;

  return (
    <Paper
      sx={{
        bgcolor: '#0f172a',
        border: '1px solid #1e3a5f',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Status banner */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: result.pathFound ? '#052e16' : '#450a0a',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        {result.pathFound ? (
          <CheckCircleIcon sx={{ color: '#10b981', fontSize: 22 }} />
        ) : (
          <CancelIcon sx={{ color: '#ef4444', fontSize: 22 }} />
        )}
        <Typography sx={{ color: result.pathFound ? '#10b981' : '#ef4444', fontWeight: 600 }}>
          {result.pathFound ? 'Shortest path found' : 'No path exists between these nodes'}
        </Typography>
        <Chip
          label={result.algorithm}
          size="small"
          sx={{ ml: 'auto', bgcolor: '#1e293b', color: '#94a3b8', fontSize: '0.7rem' }}
        />
      </Box>

      {/* Path visualization */}
      {result.pathFound && result.pathNodeIds.length > 0 && (
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #1e293b' }}>
          <Typography variant="caption" sx={{ color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Path ({result.pathNodeIds.length} hop{result.pathNodeIds.length !== 1 ? 's' : ''})
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 0.5,
              mt: 1.5,
            }}
          >
            {result.pathNodeIds.map((nodeId, index) => (
              <Box key={nodeId} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip
                  label={resolveName(nodeId)}
                  size="small"
                  sx={{
                    bgcolor: index === 0 || index === result.pathNodeIds.length - 1
                      ? '#1e3a5f'
                      : '#1e293b',
                    color: index === 0 || index === result.pathNodeIds.length - 1
                      ? '#60a5fa'
                      : '#cbd5e1',
                    border: index === 0 || index === result.pathNodeIds.length - 1
                      ? '1px solid #3b82f6'
                      : '1px solid #334155',
                    fontWeight: index === 0 || index === result.pathNodeIds.length - 1 ? 700 : 400,
                  }}
                />
                {index < result.pathNodeIds.length - 1 && (
                  <ArrowRightAltIcon sx={{ color: '#475569', fontSize: 18 }} />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Metrics */}
      <Divider sx={{ borderColor: '#1e293b' }} />
      <Box>
        <MetricRow label="Total Cost" value={formatCost(result.totalCost)} highlight />
        <MetricRow label="Execution Time" value={formatMs(result.executionTimeMs)} />
        <MetricRow label="Nodes Visited" value={result.visitedNodes} />
        <MetricRow label="Edge Relaxations" value={result.edgeRelaxations} />
      </Box>
    </Paper>
  );
}
