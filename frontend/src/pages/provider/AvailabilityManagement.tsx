import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
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
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { availabilityService, locationService } from '../../services';

const schema = yup.object().shape({
  availabilityType: yup.string().oneOf(['OFFLINE', 'VIRTUAL']).required('Availability type is required'),
  dayOfWeek: yup.string().required('Day of week is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  repeatType: yup.string().oneOf(['NONE', 'WEEKLY_2', 'WEEKLY_4', 'WEEKLY_6', 'WEEKLY_8']).required('Repeat type is required'),
  locationId: yup.number().nullable().optional(),
  isActive: yup.boolean().required(),
});

interface AvailabilitySlot {
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

const daysOfWeek = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const AvailabilityManagement: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const theme = useTheme();

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
      locationId: null,
      isActive: true,
    },
  });

  useEffect(() => {
    fetchAvailability();
    fetchLocations();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await availabilityService.getCurrentProviderAvailability();
      // Ensure we always set an array, even if the API returns unexpected data
      setAvailability(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch availability');
      // Set empty array on error to prevent filter errors
      setAvailability([]);
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

  const handleOpenDialog = (slot?: AvailabilitySlot) => {
    if (slot) {
      setSelectedSlot(slot);
      reset({
        availabilityType: slot.availabilityType,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        repeatType: slot.repeatType,
        locationId: slot.locationId,
        isActive: slot.isActive,
      });
    } else {
      setSelectedSlot(null);
      reset({
        availabilityType: 'OFFLINE',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        repeatType: 'NONE',
        locationId: null,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSlot(null);
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

      if (selectedSlot) {
        await availabilityService.updateAvailability(selectedSlot.id, requestData);
        setSuccess('Availability updated successfully');
      } else {
        await availabilityService.createAvailability(requestData);
        setSuccess('Availability created successfully');
      }
      handleCloseDialog();
      fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'Failed to save availability');
    }
  };

  const handleDelete = async (slotId: number) => {
    try {
      setDeletingId(slotId);
      await availabilityService.deleteAvailability(slotId);
      setSuccess('Availability deleted successfully');
      fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'Failed to delete availability');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(135deg, #1e293b 30%, #475569 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Availability Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your working hours and appointment availability
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            endIcon={<ArrowForwardIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              },
            }}
          >
            Add Availability
          </Button>
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
            onClose={() => setError(null)}
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
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              Current Schedule
            </Typography>
            
            {Array.isArray(availability) && availability.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.04)' }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Day
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Start Time
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        End Time
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Repeat
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Location ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availability.map((slot) => (
                      <TableRow 
                        key={slot.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(102, 126, 234, 0.02)' 
                          } 
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={slot.availabilityType}
                            color={slot.availabilityType === 'VIRTUAL' ? 'primary' : 'secondary'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="600">
                            {slot.dayOfWeek}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {slot.startTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {slot.endTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {slot.repeatType === 'NONE' ? 'No Repeat' : 
                             slot.repeatType === 'WEEKLY_2' ? 'Weekly (2 weeks)' :
                             slot.repeatType === 'WEEKLY_4' ? 'Weekly (4 weeks)' :
                             slot.repeatType === 'WEEKLY_6' ? 'Weekly (6 weeks)' :
                             slot.repeatType === 'WEEKLY_8' ? 'Weekly (8 weeks)' : slot.repeatType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {slot.locationId || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={slot.isActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(slot.isActive)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(slot)}
                            color="primary"
                            sx={{
                              mr: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(slot.id)}
                            color="error"
                            disabled={deletingId === slot.id}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              },
                            }}
                          >
                            {deletingId === slot.id ? (
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
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ScheduleIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: theme.palette.primary.main, 
                    mb: 3,
                    opacity: 0.7,
                  }} 
                />
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  No availability set
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                  Add your working hours to start receiving appointments from patients.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    },
                  }}
                >
                  Add First Availability
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
            }}
          >
            {selectedSlot ? 'Edit Availability' : 'Add Availability'}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent sx={{ p: 4 }}>
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

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
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

                <Controller
                  name="repeatType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.repeatType}>
                      <InputLabel>Repeat Type</InputLabel>
                      <Select {...field} label="Repeat Type">
                        <MenuItem value="NONE">No Repeat</MenuItem>
                        <MenuItem value="WEEKLY_2">Weekly (Every 2 Weeks)</MenuItem>
                        <MenuItem value="WEEKLY_4">Weekly (Every 4 Weeks)</MenuItem>
                        <MenuItem value="WEEKLY_6">Weekly (Every 6 Weeks)</MenuItem>
                        <MenuItem value="WEEKLY_8">Weekly (Every 8 Weeks)</MenuItem>
                      </Select>
                      {errors.repeatType && (
                        <Typography variant="caption" color="error">
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
                        <Typography variant="caption" color="error">
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
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                {selectedSlot ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AvailabilityManagement; 