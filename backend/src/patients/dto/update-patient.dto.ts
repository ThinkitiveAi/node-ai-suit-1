import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import { IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @ApiPropertyOptional({ example: 'StrongP@ssw0rd!' })
  @IsOptional()
  @MinLength(8)
  @MaxLength(100)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    },
  )
  password?: string;
}
