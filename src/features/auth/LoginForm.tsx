import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff, RouterOutlined } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import type { FormEvent } from 'react';

interface LoginFormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid username or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <Paper className="w-full max-w-md p-8" sx={{ bgcolor: '#0f172a', color: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <Box className="flex flex-col items-center mb-8">
          <Box className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 mb-4">
            <RouterOutlined sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h4" className="font-bold">
            NetRoute
          </Typography>
          <Typography variant="body2" className="text-slate-400 mt-2">
            Network Routing Simulation
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            margin="normal"
            error={!!errors.username}
            helperText={errors.username}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#475569' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiOutlinedInput-input::placeholder': { color: '#94a3b8', opacity: 1 },
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                    sx={{ color: '#94a3b8' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#475569' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiOutlinedInput-input::placeholder': { color: '#94a3b8', opacity: 1 },
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
              '&:disabled': { bgcolor: '#475569' },
              py: 1.5,
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>

          <Box className="text-center">
            <Typography variant="body2" className="text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-semibold">
                Sign up
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
