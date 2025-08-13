# HealthCare Connect EMR - Frontend Application

A comprehensive Electronic Medical Record (EMR) system built with React, TypeScript, and Material-UI. This frontend application provides a complete healthcare management solution for both healthcare providers and patients.

## 🏥 Features

### For Healthcare Providers
- **Provider Registration & Authentication**: Secure registration with comprehensive validation
- **Provider Dashboard**: Complete EMR interface with patient management
- **Availability Management**: Set and manage appointment slots with recurring patterns
- **Patient Records**: View and manage patient medical records
- **Appointment Management**: Schedule, view, and manage appointments
- **Medical Records**: Access lab results, treatment plans, and prescriptions

### For Patients
- **Patient Registration & Authentication**: HIPAA-compliant patient registration
- **Patient Dashboard**: Personal health portal with appointment history
- **Appointment Search**: Find and book appointments with healthcare providers
- **Medical Records**: View personal medical history and test results
- **Profile Management**: Update personal and medical information

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthcare-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   └── layout/
│       └── Navbar.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── auth/
│   │   ├── ProviderRegister.tsx
│   │   ├── ProviderLogin.tsx
│   │   ├── PatientRegister.tsx
│   │   └── PatientLogin.tsx
│   ├── provider/
│   │   ├── ProviderDashboard.tsx
│   │   └── AvailabilityManagement.tsx
│   ├── patient/
│   │   ├── PatientDashboard.tsx
│   │   └── AppointmentSearch.tsx
│   └── HomePage.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
└── App.tsx
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api/v1
```

### Backend Integration
The frontend is designed to integrate with the healthcare backend API. Update the `API_BASE_URL` in `src/services/api.ts` to point to your backend server.

## 🎨 UI Components

The application uses Material-UI (MUI) for a modern, responsive design:

- **Theme**: Custom healthcare-themed color palette
- **Components**: Pre-built MUI components with custom styling
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG compliant components

## 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **Form Validation**: Comprehensive client-side validation
- **HIPAA Compliance**: Security measures for healthcare data

## 📊 Data Flow

1. **Authentication**: Users register/login through secure forms
2. **Dashboard Access**: Role-based dashboards (Provider/Patient)
3. **Data Management**: CRUD operations for appointments, records, etc.
4. **Real-time Updates**: Live data synchronization with backend

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Build for Production

```bash
# Create production build
npm run build

# Serve production build
npm install -g serve
serve -s build
```

## 🔌 API Integration

The application is ready to integrate with your backend API. The API service (`src/services/api.ts`) includes all necessary endpoints:

### Provider Endpoints
- `POST /api/v1/provider/register` - Provider registration
- `POST /api/v1/provider/login` - Provider login
- `POST /api/v1/provider/availability` - Create availability slots
- `GET /api/v1/provider/:id/availability` - Get provider availability

### Patient Endpoints
- `POST /api/v1/patient/register` - Patient registration
- `POST /api/v1/patient/login` - Patient login
- `GET /api/v1/availability/search` - Search available appointments

## 🎯 Key Features

### Provider Features
- **Multi-step Registration**: Comprehensive provider onboarding
- **Availability Management**: Advanced scheduling with recurring patterns
- **Patient Management**: Complete patient record access
- **Medical Records**: Lab results, prescriptions, treatment plans

### Patient Features
- **Easy Registration**: Streamlined patient onboarding
- **Appointment Booking**: Search and book appointments
- **Health Records**: Personal medical history access
- **Provider Search**: Find healthcare providers by specialization

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Material-UI**: Professional UI components
- **React Router**: Client-side routing
- **React Hook Form**: Form management
- **Yup**: Schema validation
- **Axios**: HTTP client
- **Date-fns**: Date manipulation

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security Features

- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based security
- **Secure Storage**: Encrypted local storage
- **Session Management**: Automatic token refresh

## 🚀 Deployment

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Vercel
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest features and security patches by regularly pulling from the main branch.

---

**HealthCare Connect EMR** - Empowering healthcare providers and patients with modern, secure, and efficient medical record management.
