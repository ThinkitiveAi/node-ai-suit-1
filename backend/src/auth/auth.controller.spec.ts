/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    patientLogin: jest.fn(),
    providerLogin: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return login response', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthResponse = {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          roleId: 1,
        },
        token: 'jwt-token',
      };

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
      } as any;

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockResponse);

      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto, mockResponse);
    });
  });

  describe('patientLogin', () => {
    it('should return patient login response', async () => {
      const loginDto: LoginDto = {
        email: 'patient@example.com',
        password: 'password123',
      };

      const mockAuthResponse = {
        user: {
          id: 1,
          email: 'patient@example.com',
          name: 'Test Patient',
        },
        token: 'jwt-token',
      };

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
      } as any;

      mockAuthService.patientLogin.mockResolvedValue(mockAuthResponse);

      const result = await controller.patientLogin(loginDto, mockResponse);

      expect(result).toEqual(mockResponse);
      expect(authService.patientLogin).toHaveBeenCalledWith(
        loginDto,
        mockResponse,
      );
    });
  });

  describe('providerLogin', () => {
    it('should return provider login response', async () => {
      const loginDto: LoginDto = {
        email: 'provider@example.com',
        password: 'password123',
      };

      const mockAuthResponse = {
        user: {
          id: 1,
          email: 'provider@example.com',
          name: 'Test Provider',
          specialty: 'Cardiology',
        },
        token: 'jwt-token',
      };

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
      } as any;

      mockAuthService.providerLogin.mockResolvedValue(mockAuthResponse);

      const result = await controller.providerLogin(loginDto, mockResponse);

      expect(result).toEqual(mockResponse);
      expect(authService.providerLogin).toHaveBeenCalledWith(
        loginDto,
        mockResponse,
      );
    });
  });

  describe('refreshToken', () => {
    it('should return refresh token response', async () => {
      const mockRequest = {
        cookies: { refreshToken: 'refresh-token' },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      const mockAuthResponse = {
        accessToken: 'new-jwt-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshToken(mockRequest, mockResponse);

      expect(result).toEqual(mockResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith('refresh-token');
    });

    it('should return error when no refresh token', async () => {
      const mockRequest = {
        cookies: {},
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      const result = await controller.refreshToken(mockRequest, mockResponse);

      expect(result).toEqual(mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No refresh token provided',
      });
    });
  });

  describe('logout', () => {
    it('should return logout response', async () => {
      const mockResponse = {
        json: jest.fn().mockReturnThis(),
      } as any;

      const mockAuthResponse = {
        message: 'Logout successful',
      };

      mockAuthService.logout.mockResolvedValue(mockAuthResponse);

      const result = await controller.logout(mockResponse);

      expect(result).toEqual(mockResponse);
      expect(authService.logout).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
      } as any;

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual({ user: mockRequest.user });
    });
  });
});
