import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum RoleType {
  STAFF = 'STAFF',
  CLINICIAN = 'CLINICIAN',
}

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Practice Owner',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Role type',
    enum: RoleType,
    default: RoleType.STAFF,
    example: RoleType.STAFF,
  })
  @IsEnum(RoleType)
  @IsOptional()
  type?: RoleType = RoleType.STAFF;
} 