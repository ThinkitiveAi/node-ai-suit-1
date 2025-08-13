import api from './api';

// API response types based on the actual API documentation
interface AvailabilityCreateRequest {
  providerId: number;
  availabilityType: 'OFFLINE' | 'VIRTUAL';
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  repeatType: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
  locationId?: number;
  isActive: boolean;
}

interface AvailabilityCreateResponse {
  availability: {
    id: number;
    providerId: number;
    availabilityType: 'OFFLINE' | 'VIRTUAL';
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    repeatType: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
    locationId?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface AvailabilityListResponse {
  data: Array<{
    id: number;
    providerId: number;
    availabilityType: 'OFFLINE' | 'VIRTUAL';
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    repeatType: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
    locationId?: number;
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
interface AvailabilityListApiResponse {
  success: boolean;
  data: {
    data: Array<{
      id: number;
      providerId: number;
      availabilityType: 'OFFLINE' | 'VIRTUAL';
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      repeatType: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
      locationId?: number;
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

interface AvailabilityDetailResponse {
  availability: {
    id: number;
    providerId: number;
    availabilityType: 'OFFLINE' | 'VIRTUAL';
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    repeatType: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
    locationId?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface AvailabilityUpdateRequest {
  providerId?: number;
  availabilityType?: 'OFFLINE' | 'VIRTUAL';
  startTime?: string;
  endTime?: string;
  repeatType?: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
  locationId?: number;
  isActive?: boolean;
}

interface AvailabilityUpdateResponse {
  availability: {
    id: number;
    providerId: number;
    availabilityType: 'OFFLINE' | 'VIRTUAL';
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    repeatType: 'NONE' | 'WEEKLY_2' | 'WEEKLY_4' | 'WEEKLY_6' | 'WEEKLY_8';
    locationId?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface DeleteResponse {
  message: string;
}

export const availabilityService = {
  // Create new availability
  async createAvailability(data: AvailabilityCreateRequest): Promise<AvailabilityCreateResponse> {
    try {
      const response = await api.post<AvailabilityCreateResponse>('/availability', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      } else {
        throw new Error('Failed to create availability. Please try again later.');
      }
    }
  },

  // Get all availability with pagination and filters
  async getAvailability(params?: {
    page?: number;
    limit?: number;
    dayOfWeek?: string;
    isActive?: boolean;
  }): Promise<AvailabilityListResponse> {
    try {
      const response = await api.get<AvailabilityListApiResponse>('/availability', { params });
      
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
        throw new Error('Failed to fetch availability. Please try again later.');
      }
    }
  },

  // Get availability by ID
  async getAvailabilityById(id: number): Promise<AvailabilityDetailResponse> {
    try {
      const response = await api.get<AvailabilityDetailResponse>(`/availability/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Availability not found');
      } else {
        throw new Error('Failed to fetch availability. Please try again later.');
      }
    }
  },

  // Update availability
  async updateAvailability(id: number, data: AvailabilityUpdateRequest): Promise<AvailabilityUpdateResponse> {
    try {
      const response = await api.patch<AvailabilityUpdateResponse>(`/availability/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      } else if (error.response?.status === 404) {
        throw new Error('Availability not found');
      } else {
        throw new Error('Failed to update availability. Please try again later.');
      }
    }
  },

  // Delete availability
  async deleteAvailability(id: number): Promise<DeleteResponse> {
    try {
      const response = await api.delete<DeleteResponse>(`/availability/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Availability not found');
      } else {
        throw new Error('Failed to delete availability. Please try again later.');
      }
    }
  },

  // Get availability for current provider
  async getCurrentProviderAvailability(): Promise<AvailabilityListResponse> {
    try {
      const response = await api.get<AvailabilityListResponse>('/availability');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to fetch provider availability. Please try again later.');
      }
    }
  },
}; 