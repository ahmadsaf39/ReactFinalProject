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
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import type { FormEvent } from 'react';

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function SignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      toast.success('Account created! Welcome.');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
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
            <PersonAddOutlined sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h4" className="font-bold">
            Create Account
          </Typography>
          <Typography variant="body2" className="text-slate-400 mt-2">
            Join NetRoute Platform
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
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
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

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    disabled={loading}
                    sx={{ color: '#94a3b8' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>

          <Box className="text-center">
            <Typography variant="body2" className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold">
                Log in
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
