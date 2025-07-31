import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User role (for staff users)', required: false })
  role?: string;

  @ApiProperty({ description: 'User status (for staff users)', required: false })
  status?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'User address', required: false })
  address?: string;

  @ApiProperty({ description: 'Provider specialty', required: false })
  specialty?: string;

  @ApiProperty({ description: 'Provider city', required: false })
  city?: string;

  @ApiProperty({ description: 'Provider state', required: false })
  state?: string;

  @ApiProperty({ description: 'Assigned provider info', required: false })
  assignedProvider?: {
    id: number;
    name: string;
    specialty: string;
  };
}

export class AuthResponseDto {
  @ApiProperty({ description: 'User information' })
  user: UserInfoDto;

  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ description: 'New JWT access token' })
  accessToken: string;
}

export class LogoutResponseDto {
  @ApiProperty({ description: 'Logout message' })
  message: string;
}

export class ProfileResponseDto {
  @ApiProperty({ description: 'Current user profile' })
  user: UserInfoDto;
}

export class TestLoginResponseDto {
  @ApiProperty({ description: 'Test message' })
  message: string;

  @ApiProperty({ description: 'Email used in test' })
  email: string;
} 