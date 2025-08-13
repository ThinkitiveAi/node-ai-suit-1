import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsIn,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EmergencyContactDto {
  @ApiProperty({ example: 'Suraj' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Family' })
  @IsNotEmpty()
  relationship: string;
}

export class CreatePatientDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    },
  )
  password: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @MaxLength(200)
  streetAddress?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @MaxLength(50)
  state?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @MaxLength(10)
  zipCode?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @MaxLength(50)
  country?: string;

  @ApiPropertyOptional({ example: '2025-07-28' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({
    example: {
      name: 'Suraj',
      phone: '1234567890',
      relationship: 'Family',
    },
    type: EmergencyContactDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  assignedProviderId?: number;
}
