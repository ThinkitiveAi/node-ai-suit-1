import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../common/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

describe('ProvidersService', () => {
  let service: ProvidersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    provider: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new provider successfully', async () => {
      const createProviderDto: CreateProviderDto = {
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        password: 'password123',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        roleId: 1,
      };

      const mockCreatedProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        roleId: 1,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.provider.findUnique.mockResolvedValue(null);
      mockPrismaService.patient.findUnique.mockResolvedValue(null);
      mockPrismaService.provider.create.mockResolvedValue(mockCreatedProvider);

      const result = await service.create(createProviderDto);

      expect(result).toEqual(mockCreatedProvider);
      expect(prismaService.provider.create).toHaveBeenCalledWith({
        data: {
          ...createProviderDto,
          password: expect.stringMatching(/^\$2b\$10\$/), // Expect bcrypt hash
        },
      });
    });

    it('should throw BadRequestException for existing email', async () => {
      const createProviderDto: CreateProviderDto = {
        email: 'existing@example.com',
        name: 'Dr. Test Provider',
        password: 'password123',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        roleId: 1,
      };

      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(createProviderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated providers with filters', async () => {
      const mockProviders = [
        {
          id: 1,
          email: 'provider1@example.com',
          name: 'Dr. Provider 1',
          phone: '+1234567890',
          specialty: 'Cardiology',
          city: 'New York',
          state: 'NY',
          roleId: 1,
          archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'provider2@example.com',
          name: 'Dr. Provider 2',
          phone: '+1234567891',
          specialty: 'Neurology',
          city: 'Los Angeles',
          state: 'CA',
          roleId: 1,
          archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.provider.findMany.mockResolvedValue(mockProviders);
      mockPrismaService.provider.count.mockResolvedValue(2);

      const result = await service.findAll(
        1,
        10,
        'Cardiology',
        'New York',
        'Dr. Provider',
        'provider@example.com',
      );

      expect(result).toEqual({
        data: mockProviders,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return empty array when no providers found', async () => {
      mockPrismaService.provider.findMany.mockResolvedValue([]);
      mockPrismaService.provider.count.mockResolvedValue(0);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return provider by id', async () => {
      const mockProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        password: 'hashedpassword',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
      };

      const mockProviderWithoutPassword = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
      };

      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProviderWithoutPassword);
      expect(prismaService.provider.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException for non-existent provider', async () => {
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update provider successfully', async () => {
      const updateProviderDto: UpdateProviderDto = {
        name: 'Dr. Updated Provider',
        phone: '+1234567891',
      };

      const mockUpdatedProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Updated Provider',
        phone: '+1234567891',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
      };

      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.provider.update.mockResolvedValue(mockUpdatedProvider);

      const result = await service.update(1, updateProviderDto);

      expect(result).toEqual(mockUpdatedProvider);
      expect(prismaService.provider.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateProviderDto,
      });
    });

    it('should throw NotFoundException for non-existent provider', async () => {
      const updateProviderDto: UpdateProviderDto = {
        name: 'Dr. Updated Provider',
      };

      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateProviderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('archive', () => {
    it('should archive provider successfully', async () => {
      const mockArchivedProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        archived: true,
      };

      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.provider.update.mockResolvedValue(mockArchivedProvider);

      const result = await service.archive(1);

      expect(result).toEqual(mockArchivedProvider);
      expect(prismaService.provider.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { archived: true },
      });
    });

    it('should throw NotFoundException for non-existent provider', async () => {
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.archive(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore provider successfully', async () => {
      const mockRestoredProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        archived: false,
      };

      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.provider.update.mockResolvedValue(mockRestoredProvider);

      const result = await service.restore(1);

      expect(result).toEqual(mockRestoredProvider);
      expect(prismaService.provider.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { archived: false },
      });
    });

    it('should throw NotFoundException for non-existent provider', async () => {
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should return provider profile', async () => {
      const mockProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        password: 'hashedpassword',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
      };

      const mockProviderWithoutPassword = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
      };

      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);

      const result = await service.getProfile(1);

      expect(result).toEqual(mockProviderWithoutPassword);
      expect(prismaService.provider.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException for non-existent provider', async () => {
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });
});
