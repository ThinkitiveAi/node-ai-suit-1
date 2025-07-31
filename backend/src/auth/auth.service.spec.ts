/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user data and token for valid credentials', async () => {
      const mockProvider = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Provider',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
        role: { name: 'STAFF' },
      };

      const mockToken = 'jwt-token';

      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.patient.findUnique.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue(mockToken);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      const result = await service.login(
        {
          email: 'test@example.com',
          password: 'password123',
        },
        mockResponse,
      );

      expect(result).toEqual({
        user: {
          id: mockProvider.id,
          email: mockProvider.email,
          name: mockProvider.name,
          phone: mockProvider.phone,
          specialty: mockProvider.specialty,
          city: mockProvider.city,
          state: mockProvider.state,
          role: mockProvider.role.name,
        },
        accessToken: mockToken,
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.provider.findUnique.mockResolvedValue(null);
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      await expect(
        service.login(
          {
            email: 'invalid@example.com',
            password: 'password123',
          },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockProvider = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Provider',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
        role: { name: 'STAFF' },
      };

      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      await expect(
        service.login(
          {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for archived user', async () => {
      const mockProvider = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Provider',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: true,
        role: { name: 'STAFF' },
      };

      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      await expect(
        service.login(
          {
            email: 'test@example.com',
            password: 'password123',
          },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('patientLogin', () => {
    it('should return patient data and token for valid credentials', async () => {
      const mockPatient = {
        id: 1,
        email: 'patient@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Patient',
        phone: '+1234567890',
        address: '123 Main St',
        archived: false,
      };

      const mockToken = 'jwt-token';

      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
      mockJwtService.sign.mockReturnValue(mockToken);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      const result = await service.patientLogin(
        {
          email: 'patient@example.com',
          password: 'password123',
        },
        mockResponse,
      );

      expect(result).toEqual({
        user: {
          id: mockPatient.id,
          email: mockPatient.email,
          name: mockPatient.name,
          phone: mockPatient.phone,
          address: mockPatient.address,
          assignedProvider: null,
        },
        accessToken: mockToken,
      });
    });

    it('should throw UnauthorizedException for invalid patient email', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      await expect(
        service.patientLogin(
          {
            email: 'invalid@example.com',
            password: 'password123',
          },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('providerLogin', () => {
    it('should return provider data and token for valid credentials', async () => {
      const mockProvider = {
        id: 1,
        email: 'provider@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Provider',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
        role: { name: 'STAFF' },
      };

      const mockToken = 'jwt-token';

      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockJwtService.sign.mockReturnValue(mockToken);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      const result = await service.providerLogin(
        {
          email: 'provider@example.com',
          password: 'password123',
        },
        mockResponse,
      );

      expect(result).toEqual({
        user: {
          id: mockProvider.id,
          email: mockProvider.email,
          name: mockProvider.name,
          phone: mockProvider.phone,
          specialty: mockProvider.specialty,
          city: mockProvider.city,
          state: mockProvider.state,
          role: 'STAFF',
        },
        accessToken: mockToken,
      });
    });

    it('should throw UnauthorizedException for invalid provider email', async () => {
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      await expect(
        service.providerLogin(
          {
            email: 'invalid@example.com',
            password: 'password123',
          },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
