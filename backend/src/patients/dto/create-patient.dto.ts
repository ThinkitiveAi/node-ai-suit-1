import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ example: '123 Main St, City, State' })
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  assignedProviderId?: number;
}
