import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RolesGuard } from '../middleware/roles.guard';
import { Roles } from '../middleware/roles.decorator';
import {
  CreateRoleResponseDto,
  RoleListResponseDto,
  UpdateRoleResponseDto,
} from './dto/role-response.dto';

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new role (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully.',
    type: CreateRoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<CreateRoleResponseDto> {
    const role = await this.rolesService.create(createRoleDto);
    return { role, message: 'Role created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of roles.',
    type: RoleListResponseDto,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['STAFF', 'CLINICIAN'],
    description: 'Filter by role type',
  })
  async findAll(
    @Query('type') type?: 'STAFF' | 'CLINICIAN',
  ): Promise<RoleListResponseDto> {
    const data = await this.rolesService.findAll(type);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Role details.',
    type: CreateRoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CreateRoleResponseDto> {
    const role = await this.rolesService.findOne(id);
    return { role, message: 'Role retrieved successfully' };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update role by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Role updated.',
    type: UpdateRoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<UpdateRoleResponseDto> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return { role, message: 'Role updated successfully' };
  }
}
