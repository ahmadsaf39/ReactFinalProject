import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import type { DashboardStats } from '../../api/dashboardApi';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import LinkIcon from '@mui/icons-material/Link';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import { formatCost } from '../../utils/formatCost';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  color: string;
  loading: boolean;
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  return (
    <Card
      sx={{
        bgcolor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
        </Box>
        {loading ? (
          <Skeleton variant="text" width={80} height={40} sx={{ bgcolor: '#334155' }} />
        ) : (
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
}

const STAT_CARDS = (stats: DashboardStats | null) => [
  { label: 'Total Nodes', value: stats?.totalNodes ?? 0, icon: DeviceHubIcon, color: '#3b82f6' },
  { label: 'Total Links', value: stats?.totalLinks ?? 0, icon: LinkIcon, color: '#8b5cf6' },
  { label: 'Simulations Run', value: stats?.totalSimulations ?? 0, icon: TimelineIcon, color: '#f59e0b' },
  { label: 'Active Nodes', value: stats?.activeNodes ?? 0, icon: CheckCircleOutlineIcon, color: '#10b981' },
  { label: 'Inactive Nodes', value: stats?.inactiveNodes ?? 0, icon: RemoveCircleOutlineIcon, color: '#ef4444' },
  {
    label: 'Avg Link Cost',
    value: stats ? formatCost(Math.round(stats.averageLinkCost)) : '—',
    icon: SpeedIcon,
    color: '#06b6d4',
  },
];

export default function StatsGrid({ stats, loading }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
    >
      {STAT_CARDS(stats).map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
          loading={loading}
        />
      ))}
    </Box>
  );
}
