import api from './api';

// API response types based on the actual API documentation
interface ProviderOnboardRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  specialty: string;
  licenseNumber?: string;
  roleId: number;
}

interface ProviderOnboardResponse {
  success: boolean;
  data: {
    provider: {
      id: number;
      email: string;
      name: string;
      phone: string;
      specialty: string;
      streetAddress: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      roleId: number;
      archived: boolean;
      createdAt: string;
      updatedAt: string;
    };
    message: string;
  };
  timestamp: string;
}

interface ProviderListResponse {
  data: Array<{
    id: number;
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    specialty: string;
    licenseNumber: string;
    isActive: boolean;
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
interface ProviderListApiResponse {
  success: boolean;
  data: {
    data: Array<{
      id: number;
      email: string;
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      specialty: string;
      licenseNumber: string;
      isActive: boolean;
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

interface ProviderProfileResponse {
  success: boolean;
  data: {
    provider: {
      id: number;
      email: string;
      name: string;
      phone: string;
      specialty: string;
      streetAddress: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      roleId: number;
      archived: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
  timestamp: string;
}

interface ProviderUpdateRequest {
  name?: string;
  phone?: string;
  specialty?: string;
}

interface ProviderUpdateResponse {
  provider: {
    id: number;
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    specialty: string;
    licenseNumber: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface DeleteResponse {
  message: string;
}

export const providerService = {
  // Onboard a new provider
  async onboardProvider(data: ProviderOnboardRequest): Promise<ProviderOnboardResponse> {
    try {
      const response = await api.post<ProviderOnboardResponse>('/providers/onboard', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      } else {
        throw new Error('Failed to onboard provider. Please try again later.');
      }
    }
  },

  // Get all providers with pagination and filters
  async getProviders(params?: {
    page?: number;
    limit?: number;
    specialty?: string;
    city?: string;
    name?: string;
    email?: string;
  }): Promise<ProviderListResponse> {
    try {
      const response = await api.get<ProviderListApiResponse>('/providers', { params });
      
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
        throw new Error('Failed to fetch providers. Please try again later.');
      }
    }
  },

  // Get current provider profile
  async getCurrentProvider(): Promise<ProviderProfileResponse> {
    try {
      const response = await api.get<ProviderProfileResponse>('/providers/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to fetch provider profile. Please try again later.');
      }
    }
  },

  // Update current provider profile
  async updateCurrentProvider(data: ProviderUpdateRequest): Promise<ProviderUpdateResponse> {
    try {
      const response = await api.patch<ProviderUpdateResponse>('/providers/me', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      } else {
        throw new Error('Failed to update provider profile. Please try again later.');
      }
    }
  },

  // Get provider by ID
  async getProviderById(id: number): Promise<ProviderProfileResponse> {
    try {
      const response = await api.get<ProviderProfileResponse>(`/providers/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Provider not found');
      } else {
        throw new Error('Failed to fetch provider. Please try again later.');
      }
    }
  },

  // Delete/Archive provider
  async deleteProvider(id: number): Promise<DeleteResponse> {
    try {
      const response = await api.delete<DeleteResponse>(`/providers/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Provider not found');
      } else {
        throw new Error('Failed to delete provider. Please try again later.');
      }
    }
  },
}; 