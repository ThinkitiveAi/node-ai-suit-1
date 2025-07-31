import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAvailabilityDto } from './create-availability.dto';
import {
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  IsBoolean,
} from 'class-validator';

export class UpdateAvailabilityDto extends PartialType(CreateAvailabilityDto) {
  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime?: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o: any) => o.availabilityType === 'OFFLINE')
  @IsOptional()
  locationId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
