import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  MedicalServices as MedicalServicesIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  VerifiedUser as VerifiedUserIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import EMRLayout from '../../components/layout/EMRLayout';
import { providerService } from '../../services';

interface ProviderProfileData {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  clinic_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  verification_status: string;
  is_active: boolean;
}

const ProviderProfile: React.FC = () => {
  const [profile, setProfile] = useState<ProviderProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLicense, setShowLicense] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await providerService.getCurrentProvider();
        
        // Check if response and provider data exist
        if (!response || !response.data || !response.data.provider) {
          throw new Error('Invalid response from server');
        }
        
        const provider = response.data.provider;
        
        // Transform API response to match our component's data structure
        const transformedProfile: ProviderProfileData = {
          id: provider.id?.toString() || '0',
          email: provider.email || '',
          role: 'provider',
          first_name: provider.name ? provider.name.split(' ')[0] || '' : '',
          last_name: provider.name ? provider.name.split(' ').slice(1).join(' ') || '' : '',
          phone_number: provider.phone || '',
          specialization: provider.specialty || '',
          license_number: '', // Not provided in API response
          years_of_experience: 0, // Not provided in API response
          clinic_address: {
            street: provider.streetAddress || '',
            city: provider.city || '',
            state: provider.state || '',
            zip_code: provider.zipCode || '',
            country: provider.country || 'US'
          },
          verification_status: provider.archived ? 'pending' : 'verified',
          is_active: !provider.archived
        };
        
        setProfile(transformedProfile);
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.message || 'Failed to fetch profile data');
        
        // Set a fallback profile for development/testing
        const fallbackProfile: ProviderProfileData = {
          id: "8",
          email: "juqymafimo@mailinator.com",
          role: "provider",
          first_name: "Adena",
          last_name: "Everett",
          phone_number: "+1 (138) 598-8569",
          specialization: "Totam placeat conse",
          license_number: "MD123456789",
          years_of_experience: 0,
          clinic_address: {
            street: "Fuga Itaque id id c",
            city: "Sint molestiae est ",
            state: "Fugiat velit exerci",
            zip_code: "89247",
            country: "USA"
          },
          verification_status: "verified",
          is_active: true
        };
        setProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getVerificationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return <VerifiedUserIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'rejected':
        return <VisibilityOffIcon />;
      default:
        return <VisibilityIcon />;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <VisibilityIcon /> : <VisibilityOffIcon />;
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

  if (error) {
    return (
      <EMRLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Container>
      </EMRLayout>
    );
  }

  if (!profile) {
    return (
      <EMRLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="info">
            No profile data available
          </Alert>
        </Container>
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
              Provider Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your professional information and account details
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gap: 4 }}>
            {/* Profile Header Card */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    transform: 'translate(50%, -50%)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        fontSize: '3rem',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '4px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                    </Avatar>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      Dr. {profile.first_name} {profile.last_name}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                      {profile.specialization}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={getStatusIcon(profile.is_active)}
                        label={profile.is_active ? 'Active' : 'Inactive'}
                        color={getStatusColor(profile.is_active)}
                        sx={{
                          background: profile.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={getVerificationStatusIcon(profile.verification_status)}
                        label={profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
                        color={getVerificationStatusColor(profile.verification_status) as any}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Personal and Professional Information */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
              {/* Personal Information */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PersonIcon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Personal Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Full Name
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {profile.first_name} {profile.last_name}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Email Address
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {profile.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Phone Number
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {profile.phone_number}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Provider ID
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        #{profile.id}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <MedicalServicesIcon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Professional Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Specialization
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {profile.specialization}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        License Number
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BadgeIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {showLicense ? profile.license_number : '••••••••••'}
                        </Typography>
                        <Tooltip title={showLicense ? 'Hide License' : 'Show License'}>
                          <IconButton
                            size="small"
                            onClick={() => setShowLicense(!showLicense)}
                            sx={{ ml: 1 }}
                          >
                            {showLicense ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Years of Experience
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {profile.years_of_experience} {profile.years_of_experience === 1 ? 'year' : 'years'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Role
                      </Typography>
                      <Chip
                        label={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Clinic Address */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocationIcon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Clinic Address
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Street Address
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {profile.clinic_address.street || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      City
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {profile.clinic_address.city}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      State
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {profile.clinic_address.state}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      ZIP Code
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {profile.clinic_address.zip_code || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Country
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {profile.clinic_address.country}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Account Status
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Account Status
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(profile.is_active)}
                      label={profile.is_active ? 'Active' : 'Inactive'}
                      color={getStatusColor(profile.is_active)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Verification Status
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getVerificationStatusIcon(profile.verification_status)}
                      label={profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
                      color={getVerificationStatusColor(profile.verification_status) as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </EMRLayout>
  );
};

export default ProviderProfile; 