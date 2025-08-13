import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from './appointment-status.enum';

export class PatientResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'patient@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  streetAddress?: string;

  @ApiPropertyOptional({ example: 'New York' })
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  state?: string;
}

export class ProviderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'provider@example.com' })
  email: string;

  @ApiProperty({ example: 'Dr. Smith' })
  name: string;

  @ApiProperty({ example: 'Cardiology' })
  specialty: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;

  @ApiPropertyOptional({ example: 'New York' })
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  state?: string;
}

export class LocationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Main Clinic' })
  name: string;

  @ApiProperty({ example: '123 Medical Center Dr' })
  address: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY' })
  state: string;

  @ApiProperty({ example: '10001' })
  zipCode: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;
}

export class AppointmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  date: Date;

  @ApiPropertyOptional({ example: 1 })
  type?: number;

  @ApiPropertyOptional({ example: 1 })
  slotId?: number;

  @ApiPropertyOptional({ example: 1 })
  locationId?: number;

  @ApiPropertyOptional({ example: '10:00' })
  time?: string;

  @ApiPropertyOptional({ example: 'Patient experiencing chest pain' })
  chiefComplaint?: string;

  @ApiProperty({ example: AppointmentStatus.SCHEDULED, enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiProperty({ example: 1 })
  patientId: number;

  @ApiPropertyOptional({ example: 1 })
  patientConflictId?: number;

  @ApiProperty({ example: 1 })
  practiceUserId: number;

  @ApiProperty({ example: false })
  isEmergency: boolean;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: PatientResponseDto })
  patient?: PatientResponseDto;

  @ApiPropertyOptional({ type: ProviderResponseDto })
  provider?: ProviderResponseDto;

  @ApiPropertyOptional({ type: LocationResponseDto })
  location?: LocationResponseDto;
} 