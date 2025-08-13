import api from './api';
import { LoginForm, AuthResponse, Patient, Provider } from '../types';

// API response types based on the actual API documentation
interface PatientLoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string | null;
    status: string | null;
    phone: string;
    address: string;
    specialty: string | null;
    city: string | null;
    state: string | null;
    assignedProvider: {
      id: number;
      name: string;
      specialty: string;
    } | null;
  };
  accessToken: string;
}

interface ProviderLoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string | null;
    status: string | null;
    phone: string;
    address: string;
    specialty: string;
    city: string;
    state: string;
    assignedProvider: any | null;
  };
  accessToken: string;
}

interface LogoutResponse {
  message: string;
}

export const authService = {
  // Patient login
  async patientLogin(credentials: LoginForm): Promise<AuthResponse> {
    try {
      const response = await api.post<PatientLoginResponse>('/auth/patient/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { user, accessToken } = response.data;

      // Transform API response to match our internal Patient type
      const patient: Patient = {
        id: user.id.toString(),
        email: user.email,
        role: 'patient',
        first_name: user.name.split(' ')[0] || '',
        last_name: user.name.split(' ').slice(1).join(' ') || '',
        phone_number: user.phone || '',
        date_of_birth: '', // Not provided in API response
        gender: 'other', // Not provided in API response
        address: {
          street: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zip_code: '',
          country: 'US',
        },
        emergency_contact: {
          name: '',
          relationship: '',
          phone: '',
        },
        medical_history: [],
        insurance_info: {
          provider: '',
          policy_number: '',
          group_number: '',
          expiry_date: '',
        },
        email_verified: true,
        phone_verified: false,
        is_active: user.status === 'active',
      };

      return {
        access_token: accessToken,
        expires_in: 3600, // Default to 1 hour
        token_type: 'Bearer',
        patient,
      };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      } else {
        throw new Error('Login failed. Please try again later.');
      }
    }
  },

  // Provider login
  async providerLogin(credentials: LoginForm): Promise<AuthResponse> {
    try {
      const response = await api.post<ProviderLoginResponse>('/auth/provider/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { user, accessToken } = response.data;

      // Transform API response to match our internal Provider type
      const provider: Provider = {
        id: user.id.toString(),
        email: user.email,
        role: 'provider',
        first_name: user.name.split(' ')[0] || '',
        last_name: user.name.split(' ').slice(1).join(' ') || '',
        phone_number: user.phone || '',
        specialization: user.specialty || '',
        license_number: '', // Not provided in API response
        years_of_experience: 0, // Not provided in API response
        clinic_address: {
          street: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zip_code: '',
          country: 'US',
        },
        verification_status: user.status === 'active' ? 'verified' : 'pending',
        is_active: user.status === 'active',
      };

      return {
        access_token: accessToken,
        expires_in: 3600, // Default to 1 hour
        token_type: 'Bearer',
        provider,
      };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      } else {
        throw new Error('Login failed. Please try again later.');
      }
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      const response = await api.post<LogoutResponse>('/auth/logout');
      console.log('Logout response:', response.data.message);
    } catch (error) {
      // Even if logout API fails, we should still clear local storage
      console.warn('Logout API call failed:', error);
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<Patient | Provider | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
}; 