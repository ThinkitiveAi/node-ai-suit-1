import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link as MuiLink,
  CircularProgress,
  Avatar,
  Divider,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  MedicalServices as MedicalServicesIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon,
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { providerService } from '../../services';

// Type definition for onboarded provider
interface OnboardedProvider {
  id: number;
  email: string;
  name: string;
}

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirm_password: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  name: yup.string().required('Full name is required'),
  phone: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().required('ZIP code is required'),
  specialty: yup.string().required('Specialty is required'),
  licenseNumber: yup.string().required('License number is required'),
  roleId: yup.number().required('Role is required').min(1, 'Please select a role'),
});

const ProviderRegister: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [onboardedProvider, setOnboardedProvider] = useState<OnboardedProvider | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirm_password: '',
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      specialty: '',
      licenseNumber: '',
      roleId: undefined,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Transform data to match API structure
      const providerData = {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        streetAddress: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        specialty: data.specialty,
        // licenseNumber: data.licenseNumber,
        roleId: data.roleId,
      };

      const response = await providerService.onboardProvider(providerData);
      
      // Check if the response indicates success
      if (response.success && response.data.message) {
        setSuccess('Provider onboarded successfully! You can now login or go to your dashboard.');
        
        // Store provider info in state and localStorage for potential auto-login
        if (response.data.provider) {
          const providerInfo = {
            email: response.data.provider.email,
            name: response.data.provider.name,
            id: response.data.provider.id
          };
          setOnboardedProvider(providerInfo);
          localStorage.setItem('onboardedProvider', JSON.stringify(providerInfo));
        }
        
        // Navigate after 3 seconds to allow user to read the success message
        setTimeout(() => {
          navigate('/provider/login');
        }, 3000);
      } else {
        setError('Registration failed - unexpected response format');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              }}
            >
              <MedicalServicesIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Provider Registration
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              Create your healthcare provider account to manage patients and appointments
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: theme.palette.error.main,
                },
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: theme.palette.success.main,
                },
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {success}
                </Typography>
                
                {/* Show provider details if available */}
                {onboardedProvider && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Provider Details:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Name: {onboardedProvider.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Email: {onboardedProvider.email}
                    </Typography>
                    <Typography variant="body2">
                      ID: {onboardedProvider.id}
                    </Typography>
                  </Box>
                )}
                
                {/* Navigation options */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/provider/login')}
                    startIcon={<LoginIcon />}
                    size="small"
                  >
                    Go to Login
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      // Navigate to provider profile setup (they'll need to login first)
                      navigate('/provider/login', { 
                        state: { 
                          message: 'Please login to complete your profile setup',
                          redirectTo: '/provider/profile'
                        }
                      });
                    }}
                    size="small"
                  >
                    Setup Profile
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      // Clear the onboarded provider data
                      setOnboardedProvider(null);
                      localStorage.removeItem('onboardedProvider');
                      setSuccess(null);
                    }}
                    size="small"
                  >
                    Continue Registration
                  </Button>
                </Box>
              </Box>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Personal Information */}
              <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                  Personal Information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      error={!!errors.name}
                      helperText={(errors.name?.message as string) || ''}
                      InputProps={{
                        startAdornment: (
                          <MedicalServicesIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      type="email"
                      error={!!errors.email}
                      helperText={(errors.email?.message as string) || ''}
                      InputProps={{
                        startAdornment: (
                          <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type="password"
                      error={!!errors.password}
                      helperText={(errors.password?.message as string) || ''}
                      InputProps={{
                        startAdornment: (
                          <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="confirm_password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      error={!!errors.confirm_password}
                      helperText={(errors.confirm_password?.message as string) || ''}
                      InputProps={{
                        startAdornment: (
                          <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      error={!!errors.phone}
                      helperText={(errors.phone?.message as string) || ''}
                      InputProps={{
                        startAdornment: (
                          <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* Professional Information */}
              <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                  Professional Information
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Controller
                  name="specialty"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Specialty"
                      error={!!errors.specialty}
                      helperText={(errors.specialty?.message as string) || ''}
                      InputProps={{
                        startAdornment: (
                          <HospitalIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="licenseNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="License Number"
                      error={!!errors.licenseNumber}
                      helperText={(errors.licenseNumber?.message as string) || ''}
                      InputProps={{
                        startAdornment: (
                          <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* Role Selection */}
              <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                  Role
                </Typography>
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.roleId}>
                      <InputLabel id="role-label">Select Role</InputLabel>
                      <Select
                        labelId="role-label"
                        label="Select Role"
                        {...field}
                        error={!!errors.roleId}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        <MenuItem value={1}>Provider</MenuItem>
                        <MenuItem value={2}>Biller</MenuItem>
                        <MenuItem value={3}>Super User</MenuItem>
                      </Select>
                      {errors.roleId && (
                        <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                          {(errors.roleId?.message as string) || ''}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Box>

              {/* Address Information */}
              <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                  Address Information
                </Typography>
              </Box>

              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Street Address"
                    error={!!errors.address}
                    helperText={(errors.address?.message as string) || ''}
                    InputProps={{
                      startAdornment: (
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                )}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                      error={!!errors.city}
                      helperText={(errors.city?.message as string) || ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State"
                      error={!!errors.state}
                      helperText={(errors.state?.message as string) || ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="zipCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="ZIP Code"
                      error={!!errors.zipCode}
                      helperText={(errors.zipCode?.message as string) || ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  textTransform: 'none',
                  minWidth: 200,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    opacity: 0.6,
                  },
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <MuiLink
              component={Link}
              to="/provider/login"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign in to your provider account
            </MuiLink>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProviderRegister; 