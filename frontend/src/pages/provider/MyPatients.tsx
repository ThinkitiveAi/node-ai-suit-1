import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  useTheme,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material';
import EMRLayout from '../../components/layout/EMRLayout';
import { patientService } from '../../services';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  dateOfBirth: string | null;
  gender: string | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  assignedProvider: {
    id: number;
    name: string;
    specialty: string;
    city: string;
    state: string;
  } | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

const MyPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await patientService.getPatients();
      setPatients(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch patients:', err);
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = (patient: Patient) => {
    const parts = [
      patient.streetAddress,
      patient.city,
      patient.state,
      patient.zipCode
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  const getStatusColor = (archived: boolean) => {
    return archived ? 'error' : 'success';
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
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
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
              My Patients
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and view your patient information
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Search and Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                },
              }}
            />
            
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ textAlign: 'center', display:'flex' , alignItems:'center' , justifyContent:'center'  }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {patients.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 ,  }}>
                  Total Patients
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Patients Table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.04)' }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Patient
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Contact Info
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Address
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Assigned Provider
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
                    {filteredPatients.map((patient) => (
                      <TableRow 
                        key={patient.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(102, 126, 234, 0.02)' 
                          } 
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              {patient.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {patient.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: #{patient.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'grid', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {patient.email}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {patient.phone || 'Not specified'}
                              </Typography>
                            </Box>
                            {patient.dateOfBirth && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {formatDate(patient.dateOfBirth)} ({patient.gender || 'Not specified'})
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatAddress(patient)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          {patient.assignedProvider ? (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {patient.assignedProvider.name}
                              </Typography>
                              <Chip
                                label={patient.assignedProvider.specialty}
                                size="small"
                                color="primary"
                                sx={{ mt: 0.5 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {patient.assignedProvider.city}, {patient.assignedProvider.state}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not assigned
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={patient.archived ? 'Archived' : 'Active'}
                            color={getStatusColor(patient.archived)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" color="primary">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Patient">
                              <IconButton size="small" color="secondary">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {filteredPatients.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchTerm ? 'No patients found' : 'No patients available'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'Try adjusting your search terms' : 'Patients will appear here once they are assigned to you'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </EMRLayout>
  );
};

export default MyPatients; 