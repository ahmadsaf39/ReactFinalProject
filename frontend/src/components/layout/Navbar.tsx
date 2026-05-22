import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { RouterOutlined, LogoutOutlined } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Nodes', path: '/nodes' },
    { label: 'Links', path: '/links' },
    { label: 'Routing', path: '/routing' },
    { label: 'Network Map', path: '/network' },
    { label: 'Simulations', path: '/simulation' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <AppBar position="static" sx={{ bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
      <Toolbar>
        {/* Logo and App Name */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <RouterOutlined sx={{ fontSize: 28, color: '#3b82f6' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            NetRoute
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 0.5, ml: 4 }}>
          {navLinks.map((link) => (
            <Button
              key={link.path}
              color="inherit"
              onClick={() => navigate(link.path)}
              sx={{
                textTransform: 'none',
                fontSize: '0.95rem',
                color: isActive(link.path) ? '#3b82f6' : '#94a3b8',
                fontWeight: isActive(link.path) ? 600 : 400,
                bgcolor: isActive(link.path) ? 'rgba(59,130,246,0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: '#334155',
                  color: 'white',
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Right side - Username and Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
            {user?.username}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { bgcolor: '#334155' },
            }}
          >
            <LogoutOutlined sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ textTransform: 'none' }}>
              Logout
            </Typography>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
