# Healthcare EMR System Integration

This document describes the complete integration of the healthcare EMR system with patient, provider, and availability management APIs.

## API Endpoints Overview

### Authentication
- **Patient Login**: `POST /auth/patient/login`
- **Provider Login**: `POST /auth/provider/login`
- **Logout**: `POST /auth/logout`

### Patient Management
- **Onboard Patient**: `POST /patients/onboard`
- **Get All Patients**: `GET /patients`
- **Get Patient Profile**: `GET /patients/me`
- **Update Patient Profile**: `PATCH /patients/me`
- **Get Patient by ID**: `GET /patients/{id}`
- **Delete Patient**: `DELETE /patients/{id}`

### Provider Management
- **Onboard Provider**: `POST /providers/onboard`
- **Get All Providers**: `GET /providers`
- **Get Provider Profile**: `GET /providers/me`
- **Update Provider Profile**: `PATCH /providers/me`
- **Get Provider by ID**: `GET /providers/{id}`
- **Delete Provider**: `DELETE /providers/{id}`

### Availability Management
- **Create Availability**: `POST /availability`
- **Get All Availability**: `GET /availability`
- **Get Availability by ID**: `GET /availability/{id}`
- **Update Availability**: `PATCH /availability/{id}`
- **Delete Availability**: `DELETE /availability/{id}`

## Request/Response Formats

### Patient Onboarding
```json
// Request
{
  "email": "patient@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+1234567890",
  "address": "456 Patient St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10002",
  "dateOfBirth": "1990-01-01",
  "gender": "Female",
  "emergencyContact": {
    "name": "John Doe",
    "phone": "+1234567891",
    "relationship": "Spouse"
  }
}

// Response
{
  "patient": {
    "id": 1,
    "email": "patient@example.com",
    "name": "Jane Doe",
    "phone": "+1234567890",
    "address": "456 Patient St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "dateOfBirth": "1990-01-01",
    "gender": "Female",
    "emergencyContact": {
      "name": "John Doe",
      "phone": "+1234567891",
      "relationship": "Spouse"
    },
    "assignedProviderId": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Patient onboarded successfully"
}
```

### Provider Onboarding
```json
// Request
{
  "email": "provider@example.com",
  "password": "password123",
  "name": "Dr. John Smith",
  "phone": "+1234567890",
  "address": "123 Medical Center Dr",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "specialty": "Cardiology",
  "licenseNumber": "MD123456"
}

// Response
{
  "provider": {
    "id": 1,
    "email": "provider@example.com",
    "name": "Dr. John Smith",
    "phone": "+1234567890",
    "address": "123 Medical Center Dr",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "specialty": "Cardiology",
    "licenseNumber": "MD123456",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Provider onboarded successfully"
}
```

### Availability Management
```json
// Request
{
  "dayOfWeek": "Monday",
  "startTime": "09:00",
  "endTime": "17:00",
  "isActive": true
}

// Response
{
  "availability": {
    "id": 1,
    "providerId": 1,
    "dayOfWeek": "Monday",
    "startTime": "09:00",
    "endTime": "17:00",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Availability created successfully"
}
```

## Implementation Details

### Services Created

1. **`src/services/api.ts`** - Base API configuration with axios
2. **`src/services/authService.ts`** - Authentication service
3. **`src/services/patientService.ts`** - Patient management service
4. **`src/services/providerService.ts`** - Provider management service
5. **`src/services/availabilityService.ts`** - Availability management service

### UI Components Created

1. **`src/components/layout/EMRLayout.tsx`** - Modern EMR-style layout with sidebar navigation
2. **`src/pages/provider/ProviderDashboard.tsx`** - Provider dashboard with statistics and quick actions
3. **`src/pages/provider/ProviderAvailability.tsx`** - Availability management interface

### Key Features

#### EMR Layout System
- **Professional Design**: Clean, medical-grade interface with proper spacing and typography
- **Responsive Navigation**: Collapsible sidebar with role-based menu items
- **User Profile Integration**: Displays user info and role badges
- **Smart Redirects**: Automatic routing based on user type and authentication status

#### Provider Dashboard
- **Statistics Cards**: Real-time metrics for patients, appointments, and earnings
- **Quick Actions**: Easy access to common tasks
- **Recent Patients**: List of recent patient interactions
- **Modern Grid Layout**: Responsive design that works on all devices

#### Availability Management
- **Schedule Table**: Clear view of all availability slots
- **Add/Edit Dialogs**: Intuitive forms for managing schedules
- **Status Management**: Active/inactive toggle for each slot
- **Quick Stats**: Overview of total, active, and inactive slots
- **Floating Action Button**: Easy access to add new availability

### Authentication & Security

- **JWT Token Management**: Automatic token storage and injection
- **Role-Based Access**: Different interfaces for patients and providers
- **Smart Error Handling**: User-friendly error messages
- **Automatic Logout**: Session management with proper cleanup

### Data Management

- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Comprehensive error handling for all API calls
- **Loading States**: Proper loading indicators for better UX
- **Form Validation**: Client-side validation with Yup schemas

## Configuration

### Environment Variables
```bash
REACT_APP_API_URL=http://192.168.0.144:3000/api
REACT_APP_ENV=development
```

### API Base Configuration
- **Base URL**: Configurable via environment variable
- **Timeout**: 10 seconds
- **Headers**: Automatic Content-Type and Authorization
- **Interceptors**: Automatic token management and error handling

## Testing

### Test Credentials

**Patient Login:**
- Email: `patient@example.com`
- Password: `password123`

**Provider Login:**
- Email: `provider@example.com`
- Password: `password123`

### Testing Workflow

1. **Start Development Server**: `npm start`
2. **Test Authentication**: Login with test credentials
3. **Test Provider Features**: 
   - View dashboard statistics
   - Manage availability schedule
   - View patient list
4. **Test Patient Features**:
   - View patient dashboard
   - Update profile information
   - Browse providers

## File Structure

```
src/
├── services/
│   ├── api.ts                 # Base API configuration
│   ├── authService.ts         # Authentication service
│   ├── patientService.ts      # Patient management
│   ├── providerService.ts     # Provider management
│   ├── availabilityService.ts # Availability management
│   └── index.ts              # Service exports
├── components/
│   └── layout/
│       └── EMRLayout.tsx     # EMR layout component
├── pages/
│   ├── auth/
│   │   ├── PatientLogin.tsx   # Patient login
│   │   ├── ProviderLogin.tsx  # Provider login
│   │   ├── PatientRegister.tsx # Patient registration
│   │   └── ProviderRegister.tsx # Provider registration
│   └── provider/
│       ├── ProviderDashboard.tsx    # Provider dashboard
│       └── ProviderAvailability.tsx # Availability management
└── types/
    └── index.ts              # TypeScript interfaces
```

## Security Notes

- **Token Storage**: JWT tokens stored in localStorage (consider httpOnly cookies for production)
- **Automatic Cleanup**: Tokens cleared on logout and 401 responses
- **Role-Based Routing**: Different interfaces based on user role
- **Input Validation**: Both client-side and server-side validation
- **Error Handling**: Secure error messages that don't expose sensitive information

## Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Caching**: API responses cached where appropriate
- **Optimistic Updates**: UI updates immediately, API calls in background
- **Debounced Search**: Search inputs debounced to reduce API calls
- **Pagination**: Large datasets paginated for better performance

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: Service worker for offline functionality
- **Advanced Filtering**: Complex search and filter options
- **Export Features**: PDF/Excel export capabilities
- **Mobile App**: React Native version for mobile devices 