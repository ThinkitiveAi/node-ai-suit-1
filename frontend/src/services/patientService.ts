import api from './api';

// API response types based on the actual API documentation
interface PatientOnboardRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface PatientOnboardResponse {
  patient: {
    id: number;
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    dateOfBirth: string;
    gender: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    assignedProviderId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface PatientListResponse {
  data: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    streetAddress: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string;
    dateOfBirth: string | null;
    gender: string | null;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    } | null;
    assignedProvider: {
      id: number;
      name: string;
      specialty: string;
      city: string;
      state: string;
    } | null;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Updated to match the actual API response structure
interface PatientListApiResponse {
  success: boolean;
  data: {
    data: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      streetAddress: string | null;
      city: string | null;
      state: string | null;
      zipCode: string | null;
      country: string;
      dateOfBirth: string | null;
      gender: string | null;
      emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
      } | null;
      assignedProvider: {
        id: number;
        name: string;
        specialty: string;
        city: string;
        state: string;
      } | null;
      archived: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

interface PatientProfileResponse {
  patient: {
    id: number;
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    dateOfBirth: string;
    gender: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    assignedProviderId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface PatientUpdateRequest {
  name?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface PatientUpdateResponse {
  patient: {
    id: number;
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    dateOfBirth: string;
    gender: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    assignedProviderId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface DeleteResponse {
  message: string;
}

export const patientService = {
  // Onboard a new patient
  async onboardPatient(data: PatientOnboardRequest): Promise<PatientOnboardResponse> {
    try {
      const response = await api.post<PatientOnboardResponse>('/patients/onboard', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      } else {
        throw new Error('Failed to onboard patient. Please try again later.');
      }
    }
  },

  // Get all patients with pagination and filters
  async getPatients(params?: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
  }): Promise<PatientListResponse> {
    try {
      const response = await api.get<PatientListApiResponse>('/patients', { params });
      
      // Transform the nested response structure to match our expected format
      return {
        data: response.data.data.data,
        pagination: {
          page: response.data.data.meta.page,
          limit: response.data.data.meta.limit,
          total: response.data.data.meta.total,
          totalPages: response.data.data.meta.totalPages,
        }
      };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to fetch patients. Please try again later.');
      }
    }
  },

  // Get current patient profile
  async getCurrentPatient(): Promise<PatientProfileResponse> {
    try {
      const response = await api.get<PatientProfileResponse>('/patients/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to fetch patient profile. Please try again later.');
      }
    }
  },

  // Update current patient profile
  async updateCurrentPatient(data: PatientUpdateRequest): Promise<PatientUpdateResponse> {
    try {
      const response = await api.patch<PatientUpdateResponse>('/patients/me', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      } else {
        throw new Error('Failed to update patient profile. Please try again later.');
      }
    }
  },

  // Get patient by ID
  async getPatientById(id: number): Promise<PatientProfileResponse> {
    try {
      const response = await api.get<PatientProfileResponse>(`/patients/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Patient not found');
      } else {
        throw new Error('Failed to fetch patient. Please try again later.');
      }
    }
  },

  // Delete/Archive patient
  async deletePatient(id: number): Promise<DeleteResponse> {
    try {
      const response = await api.delete<DeleteResponse>(`/patients/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Patient not found');
      } else {
        throw new Error('Failed to delete patient. Please try again later.');
      }
    }
  },
}; 