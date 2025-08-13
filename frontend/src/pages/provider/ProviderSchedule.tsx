import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EMRLayout from '../../components/layout/EMRLayout';

interface ScheduleSlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  availabilityType: 'OFFLINE' | 'VIRTUAL';
  location?: string;
  isActive: boolean;
}

const ProviderSchedule: React.FC = () => {
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // TODO: Fetch schedule from API
    // For now, using mock data
    const mockSchedule: ScheduleSlot[] = [
      {
        id: 1,
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00',
        availabilityType: 'OFFLINE',
        location: 'Main Office',
        isActive: true,
      },
      {
        id: 2,
        dayOfWeek: 'TUESDAY',
        startTime: '09:00',
        endTime: '17:00',
        availabilityType: 'OFFLINE',
        location: 'Main Office',
        isActive: true,
      },
      {
        id: 3,
        dayOfWeek: 'WEDNESDAY',
        startTime: '10:00',
        endTime: '18:00',
        availabilityType: 'VIRTUAL',
        isActive: true,
      },
      {
        id: 4,
        dayOfWeek: 'THURSDAY',
        startTime: '09:00',
        endTime: '17:00',
        availabilityType: 'OFFLINE',
        location: 'Main Office',
        isActive: true,
      },
      {
        id: 5,
        dayOfWeek: 'FRIDAY',
        startTime: '09:00',
        endTime: '16:00',
        availabilityType: 'OFFLINE',
        location: 'Main Office',
        isActive: true,
      },
    ];
    
    setTimeout(() => {
      setScheduleSlots(mockSchedule);
      setLoading(false);
    }, 1000);
  }, []);

  const getDayColor = (day: string) => {
    switch (day) {
      case 'MONDAY':
        return 'primary';
      case 'TUESDAY':
        return 'secondary';
      case 'WEDNESDAY':
        return 'success';
      case 'THURSDAY':
        return 'info';
      case 'FRIDAY':
        return 'warning';
      case 'SATURDAY':
        return 'error';
      case 'SUNDAY':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <EMRLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </EMRLayout>
    );
  }

  return (
    <EMRLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            My Schedule
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/provider/availability')}
          >
            Manage Availability
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {scheduleSlots.map((slot) => (
            <Box key={slot.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: slot.isActive ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={slot.dayOfWeek}
                      color={getDayColor(slot.dayOfWeek) as any}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Chip
                      label={slot.availabilityType}
                      color={slot.availabilityType === 'VIRTUAL' ? 'secondary' : 'primary'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Typography>
                  </Box>
                  
                  {slot.location && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        📍 {slot.location}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={slot.isActive ? 'Active' : 'Inactive'}
                      color={slot.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate('/provider/availability')}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {scheduleSlots.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Schedule Set
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set your availability to create your weekly schedule
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/provider/availability')}
            >
              Set Availability
            </Button>
          </Paper>
        )}
      </Box>
    </EMRLayout>
  );
};

export default ProviderSchedule; 