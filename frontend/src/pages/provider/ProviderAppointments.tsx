import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EMRLayout from '../../components/layout/EMRLayout';

interface Appointment {
  id: number;
  uuid: string;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  status: string;
  type: string;
  chiefComplaint?: string;
  isEmergency: boolean;
}

const ProviderAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // TODO: Fetch appointments from API
    // For now, using mock data
    const mockAppointments: Appointment[] = [
      {
        id: 1,
        uuid: 'app-001',
        date: '2025-01-20',
        time: '09:00 AM',
        patientName: 'John Doe',
        patientEmail: 'john.doe@example.com',
        status: 'Scheduled',
        type: 'Regular Checkup',
        chiefComplaint: 'Annual physical examination',
        isEmergency: false,
      },
      {
        id: 2,
        uuid: 'app-002',
        date: '2025-01-20',
        time: '10:30 AM',
        patientName: 'Jane Smith',
        patientEmail: 'jane.smith@example.com',
        status: 'Confirmed',
        type: 'Follow-up',
        chiefComplaint: 'Follow-up consultation',
        isEmergency: false,
      },
    ];
    
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    // TODO: Navigate to appointment details
    console.log('View appointment:', appointment);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    // TODO: Navigate to edit appointment
    console.log('Edit appointment:', appointment);
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
            My Appointments
          </Typography>
          <Button
            variant="contained"
            startIcon={<ScheduleIcon />}
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

        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Chief Complaint</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(appointment.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.time}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {appointment.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.patientEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.type}
                          size="small"
                          color={appointment.isEmergency ? 'error' : 'default'}
                          icon={appointment.isEmergency ? <CancelIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={getStatusColor(appointment.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {appointment.chiefComplaint || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewAppointment(appointment)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditAppointment(appointment)}
                            color="secondary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Box>
                        <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          No appointments found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Set your availability to start receiving appointments
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </EMRLayout>
  );
};

export default ProviderAppointments; 