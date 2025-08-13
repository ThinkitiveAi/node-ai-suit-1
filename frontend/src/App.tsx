import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';

// Auth Pages
import PatientLogin from './pages/auth/PatientLogin';
import ProviderLogin from './pages/auth/ProviderLogin';
import PatientRegister from './pages/auth/PatientRegister';
import ProviderRegister from './pages/auth/ProviderRegister';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import AppointmentSearch from './pages/patient/AppointmentSearch';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderAvailability from './pages/provider/ProviderAvailability';
import AvailabilityManagement from './pages/provider/AvailabilityManagement';
import ProviderProfile from './pages/provider/ProviderProfile';
import MyPatients from './pages/provider/MyPatients';

// Home Page
import HomePage from './pages/HomePage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (user) {
    try {
      const userData = JSON.parse(user);
      if (!allowedRoles.includes(userData.role)) {
        return <Navigate to="/" replace />;
      }
    } catch {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/provider/login" element={<ProviderLogin />} />
            <Route path="/patient/register" element={<PatientRegister />} />
            <Route path="/provider/register" element={<ProviderRegister />} />

            {/* Protected Patient Routes */}
            <Route 
              path="/patient/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/search" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <AppointmentSearch />
                </ProtectedRoute>
              } 
            />

            {/* Protected Provider Routes */}
            <Route 
              path="/provider/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider/profile" 
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider/patients" 
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <MyPatients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider/availability" 
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderAvailability />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider/availability-management" 
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <AvailabilityManagement />
                </ProtectedRoute>
              } 
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
