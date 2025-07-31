import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProviderDto {
  @ApiProperty({ description: 'Provider ID' })
  id: number;

  @ApiProperty({ description: 'Provider email' })
  email: string;

  @ApiProperty({ description: 'Provider name' })
  name: string;

  @ApiPropertyOptional({ description: 'Provider phone number' })
  phone?: string | null;

  @ApiProperty({ description: 'Provider specialty' })
  specialty: string;

  @ApiProperty({ description: 'Provider city' })
  city: string;

  @ApiProperty({ description: 'Provider state' })
  state: string;

  @ApiProperty({ description: 'Role ID' })
  roleId: number;

  @ApiPropertyOptional({ description: 'Role information' })
  role?: {
    id: number;
    name: string;
    type: string;
  } | null;

  @ApiProperty({ description: 'Whether provider is archived' })
  archived: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class CreateProviderResponseDto {
  @ApiProperty({ description: 'Created provider information' })
  provider: ProviderDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class ProviderListResponseDto {
  @ApiProperty({ description: 'List of providers', type: [ProviderDto] })
  data: ProviderDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProviderProfileResponseDto {
  @ApiProperty({ description: 'Provider profile information' })
  provider: ProviderDto;
}

export class UpdateProviderResponseDto {
  @ApiProperty({ description: 'Updated provider information' })
  provider: ProviderDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class ArchiveProviderResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
} 