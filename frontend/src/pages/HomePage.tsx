import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security and HIPAA compliance.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'Fast & Efficient',
      description: 'Streamlined processes for quick appointments and seamless healthcare management.',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you with any healthcare needs.',
    },
  ];

  const benefits = [
    'Easy appointment scheduling',
    'Secure patient records',
    'Real-time availability',
    'Professional healthcare providers',
    'Comprehensive medical history',
    'HIPAA compliant platform',
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <HospitalIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
            
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #ffffff 30%, #e2e8f0 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Healthcare EMR System
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              Modern, secure, and efficient electronic medical records system for healthcare providers and patients
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Button
                component={Link}
                to="/patient/login"
                variant="contained"
                size="large"
                startIcon={<PersonIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
                  },
                }}
              >
                Patient Login
              </Button>
              
              <Button
                component={Link}
                to="/provider/login"
                variant="outlined"
                size="large"
                startIcon={<MedicalServicesIcon />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Provider Login
              </Button>
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label="HIPAA Compliant"
                color="success"
                variant="filled"
                sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
              />
              <Chip
                label="Secure & Private"
                color="primary"
                variant="filled"
                sx={{ bgcolor: 'rgba(37, 99, 235, 0.2)', color: '#3b82f6' }}
              />
              <Chip
                label="24/7 Support"
                color="secondary"
                variant="filled"
                sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1e293b 30%, #475569 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose Our Platform?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Experience the future of healthcare management with our cutting-edge EMR system
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 8 }}>
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 3,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Benefits Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              mb: 4,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1e293b 30%, #475569 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Platform Benefits
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, justifyContent: 'center' }}>
            {benefits.map((benefit, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                }}
              >
                <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                <Typography variant="body1" fontWeight={500}>
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1e293b 30%, #475569 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ready to Get Started?
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Join thousands of healthcare providers and patients who trust our platform
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 3 }}
          >
            <Button
              component={Link}
              to="/patient/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: 'linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Register as Patient
            </Button>
            
            <Button
              component={Link}
              to="/provider/register"
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: 'rgba(37, 99, 235, 0.04)',
                },
              }}
            >
              Register as Provider
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/patient/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          py: 4,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Healthcare EMR System. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Built with modern technology for better healthcare management
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 