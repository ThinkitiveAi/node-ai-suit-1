// User Types
export interface User {
  id: string;
  email: string;
  role: 'provider' | 'patient';
}

export interface Provider extends User {
  first_name: string;
  last_name: string;
  phone_number: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  clinic_address: Address;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
}

export interface Patient extends User {
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: Address;
  emergency_contact: EmergencyContact;
  medical_history: string[];
  insurance_info: InsuranceInfo;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  assignedProviderId?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsuranceInfo {
  provider: string;
  policy_number: string;
  group_number?: string;
  expiry_date: string;
}

export interface Pricing {
  consultation_fee: number;
  follow_up_fee: number;
  emergency_fee: number;
  currency: string;
}

export interface AppointmentSlot {
  id: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  appointment_type: 'consultation' | 'follow_up' | 'emergency';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  provider?: Provider;
  patient?: Patient;
}

// Form Types
export interface ProviderRegistrationForm {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  clinic_address: Address;
}

export interface PatientRegistrationForm {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: Address;
  emergency_contact: EmergencyContact;
  insurance_info: InsuranceInfo;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface AvailabilityForm {
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency';
  is_available: boolean;
}

export interface AppointmentSearchForm {
  specialization?: string;
  location?: string;
  date?: string;
  appointment_type?: 'consultation' | 'follow_up' | 'emergency';
}

export interface AppointmentBookingForm {
  patient_id: string;
  provider_id: string;
  slot_id: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency';
  notes?: string;
} 