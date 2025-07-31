# Clinic Staff Management System

A comprehensive healthcare management system built with NestJS, providing APIs for managing clinics, providers, patients, and availability scheduling.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Provider Management**: Complete provider onboarding and profile management
- **Patient Management**: Patient registration and profile management with provider assignment
- **Location Management**: Multi-location clinic support
- **Availability Scheduling**: Provider availability management with flexible scheduling
- **Role-Based Access**: Different access levels for admin, providers, and patients

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest for unit and e2e tests

## Database Schema

The system includes the following core entities:

- **Roles**: Define user types (STAFF, CLINICIAN)
- **Providers**: Healthcare providers with specialties and locations
- **Patients**: Patient records with assigned providers
- **Locations**: Clinic locations with contact information
- **Availability**: Provider scheduling with time slots and locations

## Project Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

```bash
# Install dependencies
$ npm install

# Set up environment variables
$ cp .env.example .env
# Edit .env with your database and JWT configuration
```

### Database Setup

```bash
# Generate Prisma client
$ npx prisma generate

# Run database migrations
$ npx prisma migrate dev

# Seed the database (optional)
$ npx prisma db seed
```

## Running the Application

```bash
# Development mode
$ npm run start:dev

# Production mode
$ npm run start:prod

# Debug mode
$ npm run start:debug
```

## API Documentation

The API documentation is available in the `api-documentation/` folder, organized by module:

- **Auth**: Authentication endpoints (`/auth/`)
- **Roles**: Role management (`/roles/`)
- **Providers**: Provider management (`/providers/`)
- **Patients**: Patient management (`/patients/`)
- **Locations**: Location management (`/locations/`)
- **Availability**: Scheduling management (`/availability/`)

### Swagger Documentation

When running in development mode, Swagger documentation is available at:
```
http://localhost:3000/api
```

## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## API Endpoints

### Authentication
- `POST /auth/provider/login` - Provider login
- `POST /auth/patient/login` - Patient login

### Roles
- `GET /roles` - List all roles
- `POST /roles` - Create new role
- `PUT /roles/:id` - Update role

### Providers
- `GET /providers` - List providers with filters
- `POST /providers` - Create new provider
- `GET /providers/:id` - Get provider details
- `PUT /providers/:id` - Update provider
- `DELETE /providers/:id` - Archive provider

### Patients
- `GET /patients` - List patients with filters
- `POST /patients` - Create new patient
- `GET /patients/:id` - Get patient details
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Archive patient

### Locations
- `GET /locations` - List locations with filters
- `POST /locations` - Create new location
- `GET /locations/:id` - Get location details
- `PUT /locations/:id` - Update location
- `DELETE /locations/:id` - Archive location

### Availability
- `GET /availability` - List availability slots
- `POST /availability` - Create availability slot
- `GET /availability/:id` - Get availability details
- `PUT /availability/:id` - Update availability
- `DELETE /availability/:id` - Delete availability

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/clinic_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"

# Application
PORT=3000
NODE_ENV=development
```

## Project Structure

```
src/
├── auth/           # Authentication module
├── availability/   # Availability scheduling
├── common/         # Shared utilities and services
├── locations/      # Location management
├── middleware/     # JWT guards and role decorators
├── patients/       # Patient management
├── providers/      # Provider management
└── roles/          # Role management
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.
