import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'provider' | 'patient';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'provider') {
      return <Navigate to="/provider/dashboard" replace />;
    } else if (user?.role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 