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
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { availabilityService, locationService } from '../../services';

const schema = yup.object().shape({
  availabilityType: yup.string().oneOf(['OFFLINE', 'VIRTUAL']).required('Availability type is required'),
  dayOfWeek: yup.string().required('Day of week is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  repeatType: yup.string().oneOf(['NONE', 'WEEKLY_2', 'WEEKLY_4', 'WEEKLY_6', 'WEEKLY_8']).required('Repeat type is required'),
  locationId: yup.number().nullable().optional().test(
    'virtual-no-location',
    'Virtual availability should not have a location',
    function(value) {
      const { availabilityType } = this.parent;
      if (availabilityType === 'VIRTUAL' && value) {
        return false;
      }
      return true;
    }
  ),
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
  location?: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  provider?: {
    id: number;
    name: string;
    email: string;
    specialty: string;
  };
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      availabilityType: 'OFFLINE',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      repeatType: 'NONE',
      locationId: '',
      isActive: true,
    },
  });

  // Watch availabilityType to dynamically control location field
  const availabilityType = watch('availabilityType');

  useEffect(() => {
    fetchAvailability();
    fetchLocations();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await availabilityService.getCurrentProviderAvailability();
      // Handle nested data structure from API response
      const availabilityData = (response.data as any)?.data || response.data || [];
      setAvailability(Array.isArray(availabilityData) ? availabilityData : []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch availability');
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
        toast.error('Provider ID not found. Please login again.');
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
        locationId: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSlot(null);
    reset({
      availabilityType: 'OFFLINE',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      repeatType: 'NONE',
      locationId: '',
      isActive: true,
    });
  };

  const onSubmit = async (data: any) => {
    try {
      // Validate virtual availability should not have location
      if (data.availabilityType === 'VIRTUAL' && data.locationId) {
        toast.error('Virtual availability should not have a location.');
        return;
      }

      // Get provider ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const providerId = user?.id ? parseInt(user.id) : null;

      if (!providerId) {
        toast.error('Provider ID not found. Please login again.');
        return;
      }

      // Prepare request data with location ID from form
      const requestData = {
        providerId,
        ...data,
        locationId: data.locationId && data.locationId !== '' ? parseInt(data.locationId) : undefined
      };

      if (selectedSlot) {
        await availabilityService.updateAvailability(selectedSlot.id, requestData);
        toast.success('Availability updated successfully');
      } else {
        await availabilityService.createAvailability(requestData);
        toast.success('Availability created successfully');
      }
      handleCloseDialog();
      fetchAvailability();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save availability');
    }
  };

  const handleDelete = async (slotId: number) => {
    try {
      setDeletingId(slotId);
      await availabilityService.deleteAvailability(slotId);
      toast.success('Availability deleted successfully');
      fetchAvailability();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete availability');
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

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            minWidth: 200,
            flex: '1 1 200px'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {availability.length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Availability Slots
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            minWidth: 200,
            flex: '1 1 200px'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {availability.filter(slot => slot.isActive).length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Active Slots
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            minWidth: 200,
            flex: '1 1 200px'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {availability.filter(slot => slot.availabilityType === 'VIRTUAL').length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Virtual Sessions
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            minWidth: 200,
            flex: '1 1 200px'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {availability.filter(slot => slot.availabilityType === 'OFFLINE').length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Offline Sessions
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {Array.isArray(availability) && availability.length > 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.04)' }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, pl: 3 }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Day
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Time
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Repeat
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Location
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main, pr: 3 }}>
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
                          },
                          '&:last-child td': { border: 0 }
                        }}
                      >
                        <TableCell sx={{ pl: 3 }}>
                          <Chip
                            label={slot.availabilityType}
                            color={slot.availabilityType === 'VIRTUAL' ? 'primary' : 'secondary'}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              minWidth: 80,
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="600" color="text.primary">
                            {slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" color="text.primary" fontWeight="500">
                              {slot.startTime} - {slot.endTime}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Math.abs(new Date(`2000-01-01T${slot.endTime}`).getTime() - new Date(`2000-01-01T${slot.startTime}`).getTime()) / (1000 * 60 * 60)} hours
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {slot.repeatType === 'NONE' ? 'No Repeat' : 
                             slot.repeatType === 'WEEKLY_2' ? 'Every 2 weeks' :
                             slot.repeatType === 'WEEKLY_4' ? 'Every 4 weeks' :
                             slot.repeatType === 'WEEKLY_6' ? 'Every 6 weeks' :
                             slot.repeatType === 'WEEKLY_8' ? 'Every 8 weeks' : slot.repeatType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {slot.location ? (
                            <Box>
                              <Typography variant="body2" color="text.primary" fontWeight="500">
                                {slot.location.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {slot.location.city}, {slot.location.state}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              {slot.availabilityType === 'VIRTUAL' ? 'Virtual Session' : 'No Location'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={slot.isActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(slot.isActive)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 1,
                              minWidth: 70,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ pr: 3 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(slot)}
                              color="primary"
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
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
                                <CircularProgress size={16} />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
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
                      <Select 
                        {...field} 
                        label="Location" 
                        value={field.value || ''}
                        disabled={availabilityType === 'VIRTUAL'}
                        onChange={(e) => {
                          // Clear location when switching to virtual
                          if (availabilityType === 'VIRTUAL') {
                            field.onChange('');
                          } else {
                            field.onChange(e.target.value);
                          }
                        }}
                      >
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