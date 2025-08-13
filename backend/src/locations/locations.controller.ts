import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RolesGuard } from '../middleware/roles.guard';
import { Roles } from '../middleware/roles.decorator';
import {
  CreateLocationResponseDto,
  LocationListResponseDto,
  UpdateLocationResponseDto,
  ArchiveLocationResponseDto,
} from './dto/location-response.dto';

@ApiTags('locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new location (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully.',
    type: CreateLocationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<CreateLocationResponseDto> {
    const location = await this.locationsService.create(createLocationDto);
    return { location, message: 'Location created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'List of locations.',
    type: LocationListResponseDto,
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    type: Number,
    description: 'Filter by provider ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filter by city',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('city') city?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<LocationListResponseDto> {
    return this.locationsService.findAll(+page, +limit, city, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Location details.',
    type: CreateLocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CreateLocationResponseDto> {
    const location = await this.locationsService.findOne(id);
    return { location, message: 'Location retrieved successfully' };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update location by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Location updated.',
    type: UpdateLocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<UpdateLocationResponseDto> {
    const location = await this.locationsService.update(id, updateLocationDto);
    return { location, message: 'Location updated successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Soft delete location by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Location archived.',
    type: ArchiveLocationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ArchiveLocationResponseDto> {
    await this.locationsService.archive(id);
    return { message: 'Location archived successfully' };
  }
}
