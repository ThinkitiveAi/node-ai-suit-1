import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AvailabilityType,
  DayOfWeek,
  RepeatType,
} from './create-availability.dto';

export class AvailabilityDto {
  @ApiProperty({ description: 'Availability ID' })
  id: number;

  @ApiProperty({ description: 'Provider ID' })
  providerId: number;

  @ApiPropertyOptional({ description: 'Location ID' })
  locationId?: number | null;

  @ApiProperty({ enum: AvailabilityType, description: 'Type of availability' })
  availabilityType: AvailabilityType;

  @ApiProperty({ enum: DayOfWeek, description: 'Day of the week' })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Start time in HH:MM format' })
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format' })
  endTime: string;

  @ApiProperty({ enum: RepeatType, description: 'Repeat type' })
  repeatType: RepeatType;

  @ApiProperty({ description: 'Whether availability is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Provider information' })
  provider?: {
    id: number;
    name: string;
    email: string;
    specialty: string;
  } | null;

  @ApiPropertyOptional({ description: 'Location information' })
  location?: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
  } | null;
}

export class CreateAvailabilityResponseDto {
  @ApiProperty({ description: 'Created availability information' })
  availability: AvailabilityDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class AvailabilityListResponseDto {
  @ApiProperty({
    description: 'List of availability slots',
    type: [AvailabilityDto],
  })
  data: AvailabilityDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UpdateAvailabilityResponseDto {
  @ApiProperty({ description: 'Updated availability information' })
  availability: AvailabilityDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class DeleteAvailabilityResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
}
