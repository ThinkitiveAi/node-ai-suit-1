import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({ description: 'Role ID' })
  id: number;

  @ApiProperty({ description: 'Role name' })
  name: string;

  @ApiProperty({ description: 'Role type' })
  type: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class CreateRoleResponseDto {
  @ApiProperty({ description: 'Created role information' })
  role: RoleDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class RoleListResponseDto {
  @ApiProperty({ description: 'List of roles', type: [RoleDto] })
  data: RoleDto[];
}

export class UpdateRoleResponseDto {
  @ApiProperty({ description: 'Updated role information' })
  role: RoleDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class DeleteRoleResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
} 