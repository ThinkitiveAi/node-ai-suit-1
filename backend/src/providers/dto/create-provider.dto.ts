import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({ example: 'provider@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Dr. Jane Smith' })
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

  @ApiProperty({ example: 'Cardiology' })
  @IsNotEmpty()
  @MaxLength(100)
  specialty: string;

  @ApiProperty({ example: 'New York' })
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsNotEmpty()
  @MaxLength(50)
  state: string;

  @ApiProperty({ example: 5, description: 'Role ID for the provider' })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}
