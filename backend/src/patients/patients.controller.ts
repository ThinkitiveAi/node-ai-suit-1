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
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
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
  CreatePatientResponseDto,
  PatientListResponseDto,
  PatientProfileResponseDto,
  UpdatePatientResponseDto,
  ArchivePatientResponseDto,
} from './dto/patient-response.dto';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    type: string;
    role?: string;
  };
}

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post('onboard')
  @ApiOperation({ summary: 'Onboard a new patient' })
  @ApiResponse({
    status: 201,
    description: 'Patient onboarded successfully.',
    type: CreatePatientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async onboard(
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<CreatePatientResponseDto> {
    const patient = await this.patientsService.create(createPatientDto);
    return { patient, message: 'Patient onboarded successfully' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('provider')
  @ApiOperation({
    summary: 'Get all patients with pagination and filters (Provider only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of patients.',
    type: PatientListResponseDto,
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
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by name',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by email',
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name?: string,
    @Query('email') email?: string,
  ): Promise<PatientListResponseDto> {
    return this.patientsService.findAll(+page, +limit, name, email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('patient')
  @ApiOperation({ summary: 'Get current patient profile (Patient only)' })
  @ApiResponse({
    status: 200,
    description: 'Patient profile.',
    type: PatientProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  async getProfile(
    @Request() req: RequestWithUser,
  ): Promise<PatientProfileResponseDto> {
    const patient = await this.patientsService.getProfile(req.user.id);
    return { patient };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('patient')
  @ApiOperation({ summary: 'Update current patient profile (Patient only)' })
  @ApiResponse({
    status: 200,
    description: 'Patient profile updated.',
    type: UpdatePatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<UpdatePatientResponseDto> {
    const patient = await this.patientsService.update(
      req.user.id,
      updatePatientDto,
    );
    return { patient, message: 'Patient profile updated successfully' };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('provider')
  @ApiOperation({ summary: 'Get patient by ID (Provider only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Patient details.',
    type: PatientProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PatientProfileResponseDto> {
    const patient = await this.patientsService.findOne(id);
    return { patient };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('provider')
  @ApiOperation({ summary: 'Soft delete patient by ID (Provider only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Patient archived.',
    type: ArchivePatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ArchivePatientResponseDto> {
    await this.patientsService.archive(id);
    return { message: 'Patient archived successfully' };
  }
}
