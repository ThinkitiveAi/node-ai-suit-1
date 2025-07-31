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
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
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
  CreateProviderResponseDto,
  ProviderListResponseDto,
  ProviderProfileResponseDto,
  UpdateProviderResponseDto,
  ArchiveProviderResponseDto,
} from './dto/provider-response.dto';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    type: string;
    role?: string;
  };
}

@ApiTags('providers')
@ApiBearerAuth('access-token')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('onboard')
  @ApiOperation({ summary: 'Onboard a new provider' })
  @ApiResponse({
    status: 201,
    description: 'Provider onboarded successfully.',
    type: CreateProviderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async onboard(
    @Body() createProviderDto: CreateProviderDto,
  ): Promise<CreateProviderResponseDto> {
    const provider = await this.providersService.create(createProviderDto);
    return { provider, message: 'Provider onboarded successfully' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('provider')
  @ApiOperation({
    summary: 'Get all providers with pagination and filters (Provider only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of providers.',
    type: ProviderListResponseDto,
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
    name: 'specialty',
    required: false,
    type: String,
    description: 'Filter by specialty',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filter by city',
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
    @Query('specialty') specialty?: string,
    @Query('city') city?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
  ): Promise<ProviderListResponseDto> {
    return this.providersService.findAll(
      +page,
      +limit,
      specialty,
      city,
      name,
      email,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('provider')
  @ApiOperation({ summary: 'Get current provider profile (Provider only)' })
  @ApiResponse({
    status: 200,
    description: 'Provider profile.',
    type: ProviderProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  async getProfile(
    @Request() req: RequestWithUser,
  ): Promise<ProviderProfileResponseDto> {
    const provider = await this.providersService.getProfile(req.user.id);
    return { provider };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('provider')
  @ApiOperation({ summary: 'Update current provider profile (Provider only)' })
  @ApiResponse({
    status: 200,
    description: 'Provider profile updated.',
    type: UpdateProviderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProviderDto: UpdateProviderDto,
  ): Promise<UpdateProviderResponseDto> {
    const provider = await this.providersService.update(
      req.user.id,
      updateProviderDto,
    );
    return { provider, message: 'Provider profile updated successfully' };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('provider')
  @ApiOperation({ summary: 'Get provider by ID (Provider only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Provider details.',
    type: ProviderProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProviderProfileResponseDto> {
    const provider = await this.providersService.findOne(id);
    return { provider };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes('provider')
  @ApiOperation({ summary: 'Soft delete provider by ID (Provider only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Provider archived.',
    type: ArchiveProviderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ArchiveProviderResponseDto> {
    await this.providersService.archive(id);
    return { message: 'Provider archived successfully' };
  }
}
