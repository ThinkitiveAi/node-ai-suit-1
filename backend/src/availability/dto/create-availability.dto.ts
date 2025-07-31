import {
  IsNotEmpty,
  IsEnum,
  IsString,
  Matches,
  ValidateIf,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AvailabilityType {
  OFFLINE = 'OFFLINE',
  VIRTUAL = 'VIRTUAL',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum RepeatType {
  NONE = 'NONE',
  WEEKLY_2 = 'WEEKLY_2',
  WEEKLY_4 = 'WEEKLY_4',
  WEEKLY_6 = 'WEEKLY_6',
  WEEKLY_8 = 'WEEKLY_8',
}

export class CreateAvailabilityDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  providerId: number;

  @ApiProperty({ enum: AvailabilityType, example: AvailabilityType.OFFLINE })
  @IsEnum(AvailabilityType)
  availabilityType: AvailabilityType;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;

  @ApiProperty({ enum: RepeatType, example: RepeatType.NONE })
  @IsEnum(RepeatType)
  repeatType: RepeatType = RepeatType.NONE;

  @ApiPropertyOptional({ example: 1 })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o: any) => o.availabilityType === 'OFFLINE')
  @IsNotEmpty({ message: 'Location is required for offline availability' })
  locationId?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
