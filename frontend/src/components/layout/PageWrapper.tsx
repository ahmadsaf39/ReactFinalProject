import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';

export default function PageWrapper() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#020617', color: 'white' }}>
      <Navbar />
      <Box component="main" sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
