import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import dashboardApi, { type DashboardStats } from '../../api/dashboardApi';
import StatsGrid from './StatsGrid';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch {
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Network topology overview and simulation statistics
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchStats}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{
            color: '#94a3b8',
            borderColor: '#334155',
            '&:hover': { borderColor: '#3b82f6', color: '#3b82f6' },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Error state */}
      {error && !loading && (
        <Alert
          severity="error"
          sx={{ mb: 3, bgcolor: '#450a0a', color: '#fca5a5', '& .MuiAlert-icon': { color: '#ef4444' } }}
          action={
            <Button color="inherit" size="small" onClick={fetchStats}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Stats grid */}
      <StatsGrid stats={stats} loading={loading} />

      {/* Footer note */}
      {!loading && stats && (
        <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 4, textAlign: 'center' }}>
          Statistics are computed in real-time from the database.
        </Typography>
      )}
    </Box>
  );
}
