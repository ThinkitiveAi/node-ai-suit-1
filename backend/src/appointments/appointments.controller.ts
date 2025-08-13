/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AppointmentStatus } from './dto/appointment-status.enum';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RolesGuard } from '../middleware/roles.guard';
import { Roles } from '../middleware/roles.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @Roles('PROVIDER', 'PATIENT')
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments with optional filters' })
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
    name: 'patientId',
    required: false,
    type: Number,
    description: 'Filter by patient ID',
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    type: Number,
    description: 'Filter by provider ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AppointmentResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @Roles('PROVIDER', 'PATIENT')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('patientId') patientId?: number,
    @Query('providerId') providerId?: number,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findAll(
      page,
      limit,
      patientId,
      providerId,
      status,
      date,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Appointment ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @Roles('PROVIDER', 'PATIENT')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.appointmentsService.findOne(id, req.user?.id, req.user?.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Appointment ID' })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @Roles('PROVIDER', 'PATIENT')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req: any,
  ) {
    return this.appointmentsService.update(
      id,
      updateAppointmentDto,
      req.user?.id,
      req.user?.role,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @Roles('PROVIDER', 'PATIENT')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.appointmentsService.remove(id, req.user?.id, req.user?.role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiParam({ name: 'id', type: Number, description: 'Appointment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(AppointmentStatus),
          description: 'New appointment status',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment status updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid status transition',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @Roles('PROVIDER', 'PATIENT')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: AppointmentStatus,
    @Request() req: any,
  ) {
    return this.appointmentsService.updateStatus(
      id,
      status,
      req.user?.id,
      req.user?.role,
    );
  }
}
