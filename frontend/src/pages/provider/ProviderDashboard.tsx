import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { providerService, patientService } from '../../services';
import EMRLayout from '../../components/layout/EMRLayout';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  totalEarnings: number;
}

interface RecentPatient {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: 'active' | 'inactive';
}

const ProviderDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalEarnings: 0,
  });
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch providers (to get patient count)
        const providersResponse = await providerService.getProviders();
        const patientsResponse = await patientService.getPatients();

        // Mock stats for now - in real app, these would come from dedicated endpoints
        setStats({
          totalPatients: patientsResponse.data.length,
          todayAppointments: Math.floor(Math.random() * 10) + 5,
          pendingAppointments: Math.floor(Math.random() * 5) + 2,
          totalEarnings: Math.floor(Math.random() * 5000) + 2000,
        });

        // Transform patient data for recent patients list
        const recentPatientsData = patientsResponse.data.slice(0, 5).map(patient => ({
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          lastVisit: new Date(patient.createdAt).toLocaleDateString(),
          status: (patient.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
        }));

        setRecentPatients(recentPatientsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2" fontWeight="medium">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <EMRLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </EMRLayout>
    );
  }

  return (
    <EMRLayout>
      <Box sx={{ maxWidth: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Provider Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your practice today.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle="Registered patients"
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={<CalendarIcon />}
            color="#2e7d32"
            subtitle="Scheduled visits"
          />
          <StatCard
            title="Pending Appointments"
            value={stats.pendingAppointments}
            icon={<ScheduleIcon />}
            color="#ed6c02"
            subtitle="Awaiting confirmation"
          />
          <StatCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            icon={<TrendingUpIcon />}
            color="#9c27b0"
            subtitle="This month"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/provider/availability')}
                sx={{ mb: 2, py: 1.5 }}
              >
                Set Availability
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={() => navigate('/provider/appointments')}
                sx={{ mb: 2, py: 1.5 }}
              >
                View Appointments
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/provider/patients')}
                sx={{ py: 1.5 }}
              >
                Manage Patients
              </Button>
            </Box>
          </Paper>

          {/* Recent Patients */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Patients
              </Typography>
              <Button
                variant="text"
                onClick={() => navigate('/provider/patients')}
                endIcon={<ViewIcon />}
              >
                View All
              </Button>
            </Box>
            
            {recentPatients.length > 0 ? (
              <List>
                {recentPatients.map((patient, index) => (
                  <React.Fragment key={patient.id}>
                    <ListItem
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small">
                            <PhoneIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EmailIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {patient.name}
                            </Typography>
                            <Chip
                              label={patient.status}
                              size="small"
                              color={patient.status === 'active' ? 'success' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {patient.email} • {patient.phone}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last visit: {patient.lastVisit}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentPatients.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No patients found
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </EMRLayout>
  );
};

export default ProviderDashboard; 