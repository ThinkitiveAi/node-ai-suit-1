import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  IsBoolean,
  IsDateString,
  IsIn,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from './appointment-status.enum';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2024-01-15T10:00:00Z', description: 'Appointment date and time' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 1, description: 'Appointment type ID' })
  @IsOptional()
  @IsInt()
  type?: number;

  @ApiPropertyOptional({ example: 1, description: 'Slot ID' })
  @IsOptional()
  @IsInt()
  slotId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Location ID' })
  @IsOptional()
  @IsInt()
  locationId?: number;

  @ApiPropertyOptional({ 
    example: '10:00', 
    description: 'Appointment time in HH:MM format',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format (24-hour)',
  })
  time?: string;

  @ApiPropertyOptional({ 
    example: 'Patient experiencing chest pain and shortness of breath',
    description: 'Chief complaint or reason for visit',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  chiefComplaint?: string;

  @ApiPropertyOptional({ 
    example: AppointmentStatus.SCHEDULED,
    enum: AppointmentStatus,
    description: 'Appointment status',
    default: AppointmentStatus.SCHEDULED
  })
  @IsOptional()
  @IsIn(Object.values(AppointmentStatus))
  status?: AppointmentStatus;

  @ApiProperty({ example: 1, description: 'Patient ID' })
  @IsNotEmpty()
  @IsInt()
  patientId: number;

  @ApiPropertyOptional({ example: 1, description: 'Patient conflict ID' })
  @IsOptional()
  @IsInt()
  patientConflictId?: number;

  @ApiProperty({ example: 1, description: 'Provider ID' })
  @IsNotEmpty()
  @IsInt()
  practiceUserId: number;

  @ApiPropertyOptional({ 
    example: false, 
    description: 'Whether this is an emergency appointment',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;
} 