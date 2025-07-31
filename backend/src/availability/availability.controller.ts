/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  Request,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
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
import { UserTypes } from '../middleware/roles.decorator';
import {
  CreateAvailabilityResponseDto,
  AvailabilityListResponseDto,
  UpdateAvailabilityResponseDto,
  DeleteAvailabilityResponseDto,
} from './dto/availability-response.dto';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    type: string;
    role?: string;
  };
}

@ApiTags('availability')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@UserTypes('provider')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new availability slot (Provider only)' })
  @ApiResponse({
    status: 201,
    description: 'Availability created successfully.',
    type: CreateAvailabilityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or slot overlap.',
  })
  async create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @Request() req: RequestWithUser,
  ): Promise<CreateAvailabilityResponseDto> {
    createAvailabilityDto.providerId = req.user.id;
    const availability: any = await this.availabilityService.create(
      createAvailabilityDto,
    );
    return { availability, message: 'Availability created successfully' };
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all availability slots with pagination and filters (Provider only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of availability slots.',
    type: AvailabilityListResponseDto,
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
    name: 'dayOfWeek',
    required: false,
    type: String,
    description: 'Filter by day of week',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  async findAll(
    @Request() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<AvailabilityListResponseDto> {
    // Use the authenticated provider's ID
    return this.availabilityService.findAll(
      +page,
      +limit,
      req.user.id,
      dayOfWeek,
      isActive,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get availability slot by ID (Provider only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Availability slot details.',
    type: CreateAvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Availability slot not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<CreateAvailabilityResponseDto> {
    const availability = await this.availabilityService.findOne(
      id,
      req.user.id,
    );
    return { availability, message: 'Availability retrieved successfully' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update availability slot by ID (Provider only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Availability slot updated.',
    type: UpdateAvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Availability slot not found.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or slot overlap.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @Request() req: RequestWithUser,
  ): Promise<UpdateAvailabilityResponseDto> {
    const availability = await this.availabilityService.update(
      id,
      updateAvailabilityDto,
      req.user.id,
    );
    return { availability, message: 'Availability updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete availability slot by ID (Provider only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Availability slot deleted.',
    type: DeleteAvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Availability slot not found.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<DeleteAvailabilityResponseDto> {
    await this.availabilityService.remove(id, req.user.id);
    return { message: 'Availability deleted successfully' };
  }
}
