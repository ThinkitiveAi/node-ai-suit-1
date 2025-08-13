import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Switch, 
  FormControlLabel,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { availabilityService, locationService } from '../services';

const AvailabilityTest: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    availabilityType: 'VIRTUAL' as 'VIRTUAL' | 'OFFLINE',
    dayOfWeek: 'TUESDAY',
    startTime: '01:20',
    endTime: '03:20',
    repeatType: 'NONE' as 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8',
    locationId: '',
    isActive: true
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await locationService.getLocations();
        setLocations(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch locations:', err);
        setError('Failed to fetch locations');
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Get provider ID from localStorage (you might need to adjust this)
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const providerId = user?.id ? parseInt(user.id) : 8; // Default to 8 if not found

      const requestData = {
        providerId,
        ...formData,
        locationId: formData.locationId ? parseInt(formData.locationId) : undefined
      };

      console.log('Creating availability with data:', requestData);
      
      const response = await availabilityService.createAvailability(requestData);
      setSuccess('Availability created successfully!');
      console.log('Response:', response);
    } catch (err: any) {
      console.error('Failed to create availability:', err);
      setError(err.message || 'Failed to create availability');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Availability Creation Test
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Test creating availability with locationId for both VIRTUAL and OFFLINE appointments
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Availability Type</InputLabel>
            <Select
              value={formData.availabilityType}
              label="Availability Type"
              onChange={(e) => handleInputChange('availabilityType', e.target.value)}
            >
              <MenuItem value="VIRTUAL">Virtual</MenuItem>
              <MenuItem value="OFFLINE">Offline</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Day of Week</InputLabel>
            <Select
              value={formData.dayOfWeek}
              label="Day of Week"
              onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
            >
              <MenuItem value="MONDAY">Monday</MenuItem>
              <MenuItem value="TUESDAY">Tuesday</MenuItem>
              <MenuItem value="WEDNESDAY">Wednesday</MenuItem>
              <MenuItem value="THURSDAY">Thursday</MenuItem>
              <MenuItem value="FRIDAY">Friday</MenuItem>
              <MenuItem value="SATURDAY">Saturday</MenuItem>
              <MenuItem value="SUNDAY">Sunday</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Start Time"
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="End Time"
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Repeat Type</InputLabel>
            <Select
              value={formData.repeatType}
              label="Repeat Type"
              onChange={(e) => handleInputChange('repeatType', e.target.value)}
            >
              <MenuItem value="NONE">No Repeat</MenuItem>
              <MenuItem value="WEEKLY_2">Weekly (2 weeks)</MenuItem>
              <MenuItem value="WEEKLY_4">Weekly (4 weeks)</MenuItem>
              <MenuItem value="WEEKLY_6">Weekly (6 weeks)</MenuItem>
              <MenuItem value="WEEKLY_8">Weekly (8 weeks)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={formData.locationId}
              label="Location"
              onChange={(e) => handleInputChange('locationId', e.target.value)}
            >
              <MenuItem value="">No Location</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name} - {location.address}, {location.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                color="primary"
              />
            }
            label="Active"
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Availability'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Request Data Preview:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
            {JSON.stringify({
              providerId: 8,
              ...formData,
              locationId: formData.locationId ? parseInt(formData.locationId) : undefined
            }, null, 2)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AvailabilityTest; 