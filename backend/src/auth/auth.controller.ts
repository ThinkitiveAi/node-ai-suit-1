/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import {
  AuthResponseDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
  ProfileResponseDto,
  TestLoginResponseDto,
} from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test-login')
  @ApiOperation({ summary: 'Test login endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test login successful.',
    type: TestLoginResponseDto,
  })
  async testLogin(@Body() loginDto: LoginDto): Promise<TestLoginResponseDto> {
    return { message: 'Test login endpoint called', email: loginDto.email };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login staff user and get JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.login(loginDto, res);
    return res.json(result);
  }

  @Post('patient/login')
  @ApiOperation({ summary: 'Login patient and get JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async patientLogin(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.patientLogin(loginDto, res);
    return res.json(result);
  }

  @Post('provider/login')
  @ApiOperation({ summary: 'Login provider and get JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async providerLogin(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.providerLogin(loginDto, res);
    return res.json(result);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully.',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  async refreshToken(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const result = await this.authService.refreshToken(refreshToken);
    return res.json(result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and clear refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful.',
    type: LogoutResponseDto,
  })
  async logout(@Res() res: Response): Promise<Response> {
    const result = await this.authService.logout(res);
    return res.json(result);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved.',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Req() req: any): Promise<ProfileResponseDto> {
    const user = req['user'];
    return { user };
  }
}
