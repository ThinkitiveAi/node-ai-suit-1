import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { locationService } from '../services';

const LocationTest: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await locationService.getLocations();
        console.log('Location response:', response);
        setLocations(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch locations:', err);
        setError(err.message || 'Failed to fetch locations');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Locations Test ({locations.length} locations found)
      </Typography>
      
      <List>
        {locations.map((location) => (
          <ListItem key={location.id} divider>
            <ListItemText
              primary={location.name}
              secondary={`${location.address}, ${location.city}, ${location.state} ${location.zipCode}`}
            />
          </ListItem>
        ))}
      </List>
      
      {locations.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No locations found
        </Typography>
      )}
    </Box>
  );
};

export default LocationTest; 