import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 'Main Medical Center' })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '123 Medical Drive' })
  @IsNotEmpty()
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsNotEmpty()
  @MaxLength(50)
  state: string;

  @ApiProperty({ example: '10001' })
  @IsNotEmpty()
  @MaxLength(10)
  zipCode: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}
