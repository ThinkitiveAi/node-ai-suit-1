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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { availabilityService, locationService } from '../../services';
import EMRLayout from '../../components/layout/EMRLayout';

interface Availability {
  id: number;
  providerId: number;
  availabilityType: 'OFFLINE' | 'VIRTUAL';
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  repeatType: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
  locationId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilityFormData {
  availabilityType: 'OFFLINE' | 'VIRTUAL';
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  repeatType: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
  locationId?: number;
  isActive: boolean;
}

const schema = yup.object().shape({
  availabilityType: yup.string().oneOf(['OFFLINE', 'VIRTUAL']).required('Availability type is required'),
  dayOfWeek: yup.string().required('Day of week is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  repeatType: yup.string().oneOf(['NONE', 'WEEKLY_2', 'WEEKLY_4', 'WEEKLY_6', 'WEEKLY_8']).required('Repeat type is required'),
  locationId: yup.number().nullable().optional(),
  isActive: yup.boolean().required(),
});

const daysOfWeek = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const ProviderAvailability: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      availabilityType: 'OFFLINE',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      repeatType: 'NONE',
      locationId: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    fetchAvailabilities();
    fetchLocations();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await availabilityService.getCurrentProviderAvailability();
      // Ensure we always set an array, even if the API returns unexpected data
      setAvailabilities(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch availability');
      // Set empty array on error to prevent filter errors
      setAvailabilities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      // Get provider ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const providerId = user?.id ? parseInt(user.id) : null;

      if (!providerId) {
        setError('Provider ID not found. Please login again.');
        setLocations([]);
        return;
      }

      const response = await locationService.getLocationsByProviderId(providerId);
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error('Failed to fetch locations:', err);
      setLocations([]);
    }
  };

  const handleOpenDialog = (availability?: Availability) => {
    if (availability) {
      setEditingAvailability(availability);
      reset({
        availabilityType: availability.availabilityType,
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
        repeatType: availability.repeatType,
        locationId: availability.locationId,
        isActive: availability.isActive,
      });
    } else {
      setEditingAvailability(null);
      reset({
        availabilityType: 'OFFLINE',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        repeatType: 'NONE',
        locationId: undefined,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAvailability(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      // Get provider ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const providerId = user?.id ? parseInt(user.id) : null;

      if (!providerId) {
        setError('Provider ID not found. Please login again.');
        return;
      }

      // Prepare request data with location ID from form
      const requestData = {
        providerId,
        ...data,
        locationId: data.locationId ? parseInt(data.locationId) : undefined
      };

      if (editingAvailability) {
        await availabilityService.updateAvailability(editingAvailability.id, requestData);
        setSuccess('Availability updated successfully');
      } else {
        await availabilityService.createAvailability(requestData);
        setSuccess('Availability created successfully');
      }
      handleCloseDialog();
      fetchAvailabilities();
    } catch (err: any) {
      setError(err.message || 'Failed to save availability');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await availabilityService.deleteAvailability(id);
      setSuccess('Availability deleted successfully');
      fetchAvailabilities();
    } catch (err: any) {
      setError(err.message || 'Failed to delete availability');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircleIcon /> : <CancelIcon />;
  };

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
            Manage Availability
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set your working hours and availability for patient appointments.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Availability Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Current Schedule
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Availability
              </Button>
            </Box>

            {Array.isArray(availabilities) && availabilities.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Day</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Repeat</TableCell>
                      <TableCell>Location ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availabilities.map((availability) => (
                      <TableRow key={availability.id}>
                        <TableCell>
                          <Chip
                            label={availability.availabilityType}
                            color={availability.availabilityType === 'VIRTUAL' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {availability.dayOfWeek}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {availability.startTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {availability.endTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {availability.repeatType === 'NONE' ? 'No Repeat' : 
                             availability.repeatType === 'WEEKLY_2' ? 'Weekly (2 weeks)' :
                             availability.repeatType === 'WEEKLY_4' ? 'Weekly (4 weeks)' :
                             availability.repeatType === 'WEEKLY_6' ? 'Weekly (6 weeks)' :
                             availability.repeatType === 'WEEKLY_8' ? 'Weekly (8 weeks)' : availability.repeatType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {availability.locationId || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(availability.isActive)}
                            label={availability.isActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(availability.isActive)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(availability)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(availability.id)}
                            color="error"
                            disabled={deletingId === availability.id}
                          >
                            {deletingId === availability.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No availability set
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your working hours to start receiving appointments.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add First Availability
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {Array.isArray(availabilities) ? availabilities.length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Slots
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {Array.isArray(availabilities) ? availabilities.filter(a => a.isActive).length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Slots
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {Array.isArray(availabilities) ? availabilities.filter(a => !a.isActive).length : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inactive Slots
            </Typography>
          </Paper>
        </Box>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAvailability ? 'Edit Availability' : 'Add Availability'}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Controller
                  name="availabilityType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.availabilityType}>
                      <InputLabel>Availability Type</InputLabel>
                      <Select {...field} label="Availability Type">
                        <MenuItem value="OFFLINE">Offline</MenuItem>
                        <MenuItem value="VIRTUAL">Virtual</MenuItem>
                      </Select>
                      {errors.availabilityType && (
                        <Typography variant="caption" color="error">
                          {(errors.availabilityType?.message as string) || ''}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="dayOfWeek"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.dayOfWeek}>
                      <InputLabel>Day of Week</InputLabel>
                      <Select {...field} label="Day of Week">
                        {daysOfWeek.map((day) => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.dayOfWeek && (
                        <Typography variant="caption" color="error">
                          {(errors.dayOfWeek?.message as string) || ''}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Start Time"
                        type="time"
                        fullWidth
                        error={!!errors.startTime}
                        helperText={(errors.startTime?.message as string) || ''}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />

                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="End Time"
                        type="time"
                        fullWidth
                        error={!!errors.endTime}
                        helperText={(errors.endTime?.message as string) || ''}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Box>

                <Controller
                  name="repeatType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.repeatType}>
                      <InputLabel>Repeat Type</InputLabel>
                      <Select {...field} label="Repeat Type">
                        <MenuItem value="NONE">No Repeat</MenuItem>
                        <MenuItem value="WEEKLY_2">Weekly (2 weeks)</MenuItem>
                        <MenuItem value="WEEKLY_4">Weekly (4 weeks)</MenuItem>
                        <MenuItem value="WEEKLY_6">Weekly (6 weeks)</MenuItem>
                        <MenuItem value="WEEKLY_8">Weekly (8 weeks)</MenuItem>
                      </Select>
                      {errors.repeatType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {(errors.repeatType?.message as string) || ''}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="locationId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.locationId}>
                      <InputLabel>Location</InputLabel>
                      <Select {...field} label="Location">
                        <MenuItem value="">No Location</MenuItem>
                        {locations.map((location) => (
                          <MenuItem key={location.id} value={location.id}>
                            {location.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.locationId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {(errors.locationId?.message as string) || ''}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      }
                      label="Active"
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingAvailability ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>
      </Box>
    </EMRLayout>
  );
};

export default ProviderAvailability; 