/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { errorMessages } from '../common/errors/error-messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, res: Response) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginDto.email)) {
        throw new UnauthorizedException(
          errorMessages.auth.INVALID_EMAIL_FORMAT,
        );
      }

      // First try to find as provider
      const provider = await this.prisma.provider.findUnique({
        where: { email: loginDto.email },
        include: { role: true },
      });

      if (provider && !provider.archived) {
        const isMatch = await bcrypt.compare(
          loginDto.password,
          provider.password,
        );
        if (isMatch) {
          return await this.handleProviderLogin(provider, res);
        }
      }

      // If not provider, try as patient
      const patient = await this.prisma.patient.findUnique({
        where: { email: loginDto.email },
        include: { assignedProvider: true },
      });

      if (patient && !patient.archived) {
        const isMatch = await bcrypt.compare(
          loginDto.password,
          patient.password,
        );
        if (isMatch) {
          return await this.handlePatientLogin(patient, res);
        }
      }

      throw new UnauthorizedException('Invalid credentials');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async handleProviderLogin(provider: any, res: Response) {
    // Generate tokens
    const payload = {
      sub: provider.id,
      email: provider.email,
      name: provider.name,
      specialty: provider.specialty,
      role: provider.role.name,
      type: 'provider',
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return basic info and access token
    return {
      user: {
        id: provider.id,
        email: provider.email,
        name: provider.name,
        phone: provider.phone,
        specialty: provider.specialty,
        city: provider.city,
        state: provider.state,
        role: provider.role.name,
      },
      accessToken,
    };
  }

  private async handlePatientLogin(patient: any, res: Response) {
    // Generate tokens
    const payload = {
      sub: patient.id,
      email: patient.email,
      name: patient.name,
      type: 'patient',
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return basic info and access token
    return {
      user: {
        id: patient.id,
        email: patient.email,
        name: patient.name,
        phone: patient.phone,
        address: patient.address,
        assignedProvider: patient.assignedProvider
          ? {
              id: patient.assignedProvider.id,
              name: patient.assignedProvider.name,
              specialty: patient.assignedProvider.specialty,
            }
          : null,
      },
      accessToken,
    };
  }

  async patientLogin(loginDto: LoginDto, res: Response) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginDto.email)) {
        throw new UnauthorizedException(
          errorMessages.auth.INVALID_EMAIL_FORMAT,
        );
      }

      const patient = await this.prisma.patient.findUnique({
        where: { email: loginDto.email },
        include: { assignedProvider: true },
      });

      if (!patient || patient.archived) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(loginDto.password, patient.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return await this.handlePatientLogin(patient, res);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async providerLogin(loginDto: LoginDto, res: Response) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginDto.email)) {
        throw new UnauthorizedException(
          errorMessages.auth.INVALID_EMAIL_FORMAT,
        );
      }

      const provider = await this.prisma.provider.findUnique({
        where: { email: loginDto.email },
        include: { role: true },
      });

      if (!provider || provider.archived) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(
        loginDto.password,
        provider.password,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return await this.handleProviderLogin(provider, res);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verify(refreshToken);
      const payload = {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        type: decoded.type,
        ...(decoded.role && { role: decoded.role }),
        ...(decoded.specialty && { specialty: decoded.specialty }),
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(res: Response) {
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }
}
