import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import useNodes from '../../hooks/useNodes';
import useLinks from '../../hooks/useLinks';
import NetworkGraph from './NetworkGraph';

export default function NetworkMapPage() {
  const { nodes, loading: nodesLoading, error: nodesError } = useNodes();
  const { links, loading: linksLoading, error: linksError } = useLinks();

  const loading = nodesLoading || linksLoading;
  const error = nodesError || linksError;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
          Network Map
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
          Full network topology visualization
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading && (
          <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography sx={{ color: '#94a3b8' }}>Loading network topology...</Typography>
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ m: 3, bgcolor: '#450a0a', color: '#fca5a5', width: '100%' }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <NetworkGraph nodes={nodes} links={links} />
        )}
      </Box>
    </Box>
  );
}
