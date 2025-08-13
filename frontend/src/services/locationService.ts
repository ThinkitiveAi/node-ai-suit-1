import api from './api';

// API response types for locations
interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isActive: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Updated to match the actual API response structure
interface LocationApiResponse {
  success: boolean;
  data: {
    data: Location[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

interface LocationListResponse {
  data: Location[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const locationService = {
  // Get all locations
  async getLocations(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<LocationListResponse> {
    try {
      const response = await api.get<LocationApiResponse>('/locations', { params });
      
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
        throw new Error('Failed to fetch locations. Please try again later.');
      }
    }
  },

  // Get locations by provider ID
  async getLocationsByProviderId(providerId: number, params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<LocationListResponse> {
    try {
      const response = await api.get<LocationApiResponse>(`/locations`, { 
        params: { 
          providerId,
          ...params 
        } 
      });
      
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
        throw new Error('Failed to fetch locations. Please try again later.');
      }
    }
  },
}; 