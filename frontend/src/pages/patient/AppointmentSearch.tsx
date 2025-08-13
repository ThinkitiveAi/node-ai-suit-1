import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { providerService, availabilityService } from '../../services';

const schema = yup.object().shape({
  specialization: yup.string().optional(),
  location: yup.string().optional(),
  date: yup.string().optional(),
});

interface SearchForm {
  specialization?: string;
  location?: string;
  date?: string;
}

interface Provider {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
}

interface AvailabilitySlot {
  id: number;
  providerId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const AppointmentSearch: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      specialization: '',
      location: '',
      date: '',
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch providers
        const providersResponse = await providerService.getProviders({ limit: 50 });
        if (providersResponse.data) {
          setProviders(providersResponse.data);
        }

        // Fetch availability
        const availabilityResponse = await availabilityService.getAvailability({ limit: 100 });
        if (availabilityResponse.data) {
          setAvailability(availabilityResponse.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        // Set empty arrays on error to prevent filter errors
        setProviders([]);
        setAvailability([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      // Build search parameters
      const params: any = {};
      if (data.specialization) params.specialty = data.specialization;
      if (data.location) params.city = data.location;

      // Fetch filtered providers
      const providersResponse = await providerService.getProviders(params);
      if (providersResponse.data) {
        setProviders(providersResponse.data);
      }

      // Fetch availability
      const availabilityResponse = await availabilityService.getAvailability({ limit: 100 });
      if (availabilityResponse.data) {
        setAvailability(availabilityResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
      // Set empty arrays on error to prevent filter errors
      setProviders([]);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const getProviderById = (id: number) => {
    return Array.isArray(providers) ? providers.find(provider => provider.id === id) : undefined;
  };

  const getAvailableSlotsForProvider = (providerId: number) => {
    return Array.isArray(availability) ? availability.filter(slot => slot.providerId === providerId && slot.isActive) : [];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search for Appointments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Criteria
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
              <Controller
                name="specialization"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Specialization</InputLabel>
                    <Select {...field} label="Specialization">
                      <MenuItem value="">All Specializations</MenuItem>
                      <MenuItem value="Cardiology">Cardiology</MenuItem>
                      <MenuItem value="Dermatology">Dermatology</MenuItem>
                      <MenuItem value="Neurology">Neurology</MenuItem>
                      <MenuItem value="Orthopedics">Orthopedics</MenuItem>
                      <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Location"
                    placeholder="City or State"
                  />
                )}
              />

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Preferred Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Box>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Available Providers ({Array.isArray(providers) ? providers.length : 0})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : Array.isArray(providers) && providers.length > 0 ? (
          <List>
            {providers.map((provider) => {
              const availableSlots = getAvailableSlotsForProvider(provider.id);
              return (
                <Card key={provider.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{provider.name}</Typography>
                            <Chip label={provider.specialty} size="small" color="primary" />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                              {provider.address}, {provider.city}, {provider.state}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <HospitalIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                              {provider.specialty}
                            </Typography>
                            {availableSlots.length > 0 && (
                              <Typography variant="body2" color="text.secondary">
                                <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                {availableSlots.length} available slots
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={availableSlots.length === 0}
                        >
                          Book Appointment
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </CardContent>
                </Card>
              );
            })}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No providers found matching your criteria.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AppointmentSearch; 