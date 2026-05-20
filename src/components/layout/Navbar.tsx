import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { RouterOutlined, LogoutOutlined } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
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
    { label: 'Simulations', path: '/simulation' },
  ];

  return (
    <AppBar position="static" sx={{ bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
      <Toolbar>
        {/* Logo and App Name */}
        <Box className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <RouterOutlined sx={{ fontSize: 28, color: '#3b82f6' }} />
          <Typography variant="h6" className="font-bold text-white">
            NetRoute
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box className="flex gap-1 ml-8">
          {navLinks.map((link) => (
            <Button
              key={link.path}
              color="inherit"
              onClick={() => navigate(link.path)}
              sx={{
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': {
                  bgcolor: '#334155',
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Right side - Username and Logout */}
        <Box className="flex items-center gap-4 ml-auto">
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
