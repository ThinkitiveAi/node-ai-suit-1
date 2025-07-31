import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({ description: 'Location ID' })
  id: number;

  @ApiProperty({ description: 'Location name' })
  name: string;

  @ApiProperty({ description: 'Location address' })
  address: string;

  @ApiProperty({ description: 'Location city' })
  city: string;

  @ApiProperty({ description: 'Location state' })
  state: string;

  @ApiProperty({ description: 'Location zip code' })
  zipCode: string;

  @ApiPropertyOptional({ description: 'Location phone number' })
  phone?: string | null;

  @ApiProperty({ description: 'Whether location is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether location is archived' })
  archived: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class CreateLocationResponseDto {
  @ApiProperty({ description: 'Created location information' })
  location: LocationDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class LocationListResponseDto {
  @ApiProperty({ description: 'List of locations', type: [LocationDto] })
  data: LocationDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UpdateLocationResponseDto {
  @ApiProperty({ description: 'Updated location information' })
  location: LocationDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class ArchiveLocationResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
} 