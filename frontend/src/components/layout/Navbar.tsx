import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  AccountCircle,
  Dashboard,
  Schedule,
  Search,
  Logout,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'provider') {
      return '/provider/dashboard';
    } else if (user?.role === 'patient') {
      return '/patient/dashboard';
    }
    return '/';
  };

  const getAvailabilityLink = () => {
    if (user?.role === 'provider') {
      return '/provider/availability';
    } else if (user?.role === 'patient') {
      return '/patient/search';
    }
    return '/';
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <HospitalIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
          }}
        >
          HealthCare Connect
        </Typography>

        {!isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/provider/login"
              startIcon={<AccountCircle />}
            >
              Provider Login
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/patient/login"
              startIcon={<AccountCircle />}
            >
              Patient Login
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              to="/provider/register"
            >
              Register
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={user?.role === 'provider' ? 'Provider' : 'Patient'}
              color="secondary"
              size="small"
            />
            
            <Button
              color="inherit"
              component={Link}
              to={getDashboardLink()}
              startIcon={<Dashboard />}
            >
              Dashboard
            </Button>

            <Button
              color="inherit"
              component={Link}
              to={getAvailabilityLink()}
              startIcon={user?.role === 'provider' ? <Schedule /> : <Search />}
            >
              {user?.role === 'provider' ? 'Availability' : 'Search'}
            </Button>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose} component={Link} to={getDashboardLink()}>
                <Dashboard sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleClose} component={Link} to={getAvailabilityLink()}>
                {user?.role === 'provider' ? (
                  <>
                    <Schedule sx={{ mr: 1 }} />
                    Manage Availability
                  </>
                ) : (
                  <>
                    <Search sx={{ mr: 1 }} />
                    Search Appointments
                  </>
                )}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 