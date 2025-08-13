import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmergencyContactResponseDto {
  @ApiProperty({ description: 'Emergency contact name' })
  name: string;

  @ApiProperty({ description: 'Emergency contact phone' })
  phone: string;

  @ApiProperty({ description: 'Emergency contact relationship' })
  relationship: string;
}

export class PatientDto {
  @ApiProperty({ description: 'Patient ID' })
  id: number;

  @ApiProperty({ description: 'Patient email' })
  email: string;

  @ApiProperty({ description: 'Patient name' })
  name: string;

  @ApiPropertyOptional({ description: 'Patient phone number' })
  phone?: string | null;

  @ApiPropertyOptional({ description: 'Patient street address' })
  streetAddress?: string | null;

  @ApiPropertyOptional({ description: 'Patient city' })
  city?: string | null;

  @ApiPropertyOptional({ description: 'Patient state' })
  state?: string | null;

  @ApiPropertyOptional({ description: 'Patient zip code' })
  zipCode?: string | null;

  @ApiPropertyOptional({ description: 'Patient country' })
  country?: string | null;

  @ApiPropertyOptional({ description: 'Patient date of birth' })
  dateOfBirth?: Date | null;

  @ApiPropertyOptional({ description: 'Patient gender' })
  gender?: string | null;

  @ApiPropertyOptional({ description: 'Emergency contact information', type: EmergencyContactResponseDto })
  emergencyContact?: EmergencyContactResponseDto | null;

  @ApiPropertyOptional({ description: 'Assigned provider ID' })
  assignedProviderId?: number | null;

  @ApiPropertyOptional({ description: 'Assigned provider information' })
  assignedProvider?: {
    id: number;
    name: string;
    specialty: string;
    city: string;
    state: string;
  } | null;

  @ApiProperty({ description: 'Whether patient is archived' })
  archived: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class CreatePatientResponseDto {
  @ApiProperty({ description: 'Created patient information' })
  patient: PatientDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class PatientListResponseDto {
  @ApiProperty({ description: 'List of patients', type: [PatientDto] })
  data: PatientDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class PatientProfileResponseDto {
  @ApiProperty({ description: 'Patient profile information' })
  patient: PatientDto;
}

export class UpdatePatientResponseDto {
  @ApiProperty({ description: 'Updated patient information' })
  patient: PatientDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class ArchivePatientResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
} 