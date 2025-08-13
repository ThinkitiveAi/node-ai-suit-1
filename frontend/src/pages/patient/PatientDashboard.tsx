import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Patient } from '../../types';
import { providerService } from '../../services';

interface ProviderInfo {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assignedProvider, setAssignedProvider] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchAssignedProvider = async () => {
      const patient = user as Patient;
      if (user && patient.assignedProviderId) {
        try {
          setLoading(true);
          const response = await providerService.getProviderById(patient.assignedProviderId);
          setAssignedProvider(response.provider);
        } catch (err: any) {
          setError('Failed to fetch assigned provider information');
          console.error('Error fetching provider:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchAssignedProvider();
  }, [user]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
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

        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #1e293b 30%, #475569 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome back, {user?.first_name}!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Here's your health information and upcoming appointments
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {/* Patient Info Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.primary.main, 
                    mr: 3,
                    width: 60,
                    height: 60,
                    fontSize: '1.5rem',
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Patient ID: {user?.id}
                  </Typography>
                </Box>
              </Box>
              
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)', color: theme.palette.primary.main, width: 32, height: 32 }}>
                      <EmailIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Email" 
                    secondary={user?.email}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: theme.palette.success.main, width: 32, height: 32 }}>
                      <PhoneIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Phone" 
                    secondary={(user as Patient)?.phone_number || 'Not provided'}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: theme.palette.warning.main, width: 32, height: 32 }}>
                      <LocationIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Address" 
                    secondary={
                      (user as Patient)?.address 
                        ? `${(user as Patient).address.street}, ${(user as Patient).address.city}, ${(user as Patient).address.state}`
                        : 'Not provided'
                    }
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Assigned Provider Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.secondary.main, 
                    mr: 3,
                    width: 60,
                    height: 60,
                    fontSize: '1.5rem',
                  }}
                >
                  <HospitalIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Assigned Provider
                  </Typography>
                  <Chip 
                    label={assignedProvider ? 'Assigned' : 'Not Assigned'} 
                    color={assignedProvider ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                  />
                </Box>
              </Box>
              
              {assignedProvider ? (
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)', color: theme.palette.primary.main, width: 32, height: 32 }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Name" 
                      secondary={assignedProvider.name}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: theme.palette.success.main, width: 32, height: 32 }}>
                        <HospitalIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Specialty" 
                      secondary={assignedProvider.specialty}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: theme.palette.success.main, width: 32, height: 32 }}>
                        <PhoneIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Phone" 
                      secondary={assignedProvider.phone}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: theme.palette.warning.main, width: 32, height: 32 }}>
                        <LocationIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Location" 
                      secondary={`${assignedProvider.address}, ${assignedProvider.city}, ${assignedProvider.state}`}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                    No provider assigned yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You haven't been assigned to a healthcare provider yet.
                  </Typography>
                  <Button 
                    variant="contained"
                    startIcon={<HospitalIcon />}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                      },
                    }}
                  >
                    Find a Provider
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CalendarIcon />}
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    },
                  }}
                >
                  Book Appointment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  View Appointments
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HospitalIcon />}
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  sx={{
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: theme.palette.secondary.dark,
                      backgroundColor: 'rgba(16, 185, 129, 0.04)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Medical Records
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  sx={{
                    borderColor: theme.palette.warning.main,
                    color: theme.palette.warning.main,
                    borderRadius: 2,
                    py: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: theme.palette.warning.dark,
                      backgroundColor: 'rgba(245, 158, 11, 0.04)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity Section */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1e293b 30%, #475569 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Recent Activity
          </Typography>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                No recent activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your recent appointments and activities will appear here
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default PatientDashboard; 