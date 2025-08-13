import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

interface EMRLayoutProps {
  children: React.ReactNode;
}

const EMRLayout: React.FC<EMRLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isPatient = user?.role === 'patient';
  const isProvider = user?.role === 'provider';

  const patientMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/patient/dashboard' },
    { text: 'My Profile', icon: <PersonIcon />, path: '/patient/profile' },
    { text: 'Find Providers', icon: <MedicalServicesIcon />, path: '/patient/providers' },
    { text: 'My Appointments', icon: <CalendarIcon />, path: '/patient/appointments' },
    { text: 'Medical Records', icon: <HospitalIcon />, path: '/patient/records' },
  ];

  const providerMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/provider/dashboard' },
    { text: 'My Profile', icon: <PersonIcon />, path: '/provider/profile' },
    { text: 'My Patients', icon: <PeopleIcon />, path: '/provider/patients' },
    { text: 'Schedule', icon: <ScheduleIcon />, path: '/provider/schedule' },
    { text: 'Appointments', icon: <CalendarIcon />, path: '/provider/appointments' },
    { text: 'Availability', icon: <ScheduleIcon />, path: '/provider/availability' },
  ];

  const menuItems = isPatient ? patientMenuItems : providerMenuItems;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Brand */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <HospitalIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary">
            HealthCare EMR
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Electronic Medical Records
          </Typography>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight="medium">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={isPatient ? 'Patient' : 'Provider'}
          size="small"
          color={isPatient ? 'primary' : 'secondary'}
          sx={{ fontSize: '0.75rem' }}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Settings and Logout */}
      <Box sx={{ p: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate('/settings');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ mx: 1, borderRadius: 1 }}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { 
          handleProfileMenuClose(); 
          navigate(isProvider ? '/provider/profile' : '/patient/profile'); 
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // AppBar height
          backgroundColor: theme.palette.grey[50],
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default EMRLayout; 