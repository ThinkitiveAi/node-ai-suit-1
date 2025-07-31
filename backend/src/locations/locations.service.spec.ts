import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { PrismaService } from '../common/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

describe('LocationsService', () => {
  let service: LocationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    location: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new location successfully', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Main Medical Center',
        address: '123 Medical Drive',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '+1234567890',
      };

      const mockCreatedLocation = {
        id: 1,
        ...createLocationDto,
        isActive: true,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.location.findFirst.mockResolvedValue(null);
      mockPrismaService.location.create.mockResolvedValue(mockCreatedLocation);

      const result = await service.create(createLocationDto);

      expect(result).toEqual(mockCreatedLocation);
      expect(prismaService.location.create).toHaveBeenCalledWith({
        data: createLocationDto,
      });
    });

    it('should throw BadRequestException for existing name in same city', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Existing Medical Center',
        address: '123 Medical Drive',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '+1234567890',
      };

      mockPrismaService.location.findFirst.mockResolvedValue({ id: 1 });

      await expect(service.create(createLocationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated locations with filters', async () => {
      const mockLocations = [
        {
          id: 1,
          name: 'Main Medical Center',
          address: '123 Medical Drive',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          phone: '+1234567890',
          isActive: true,
          archived: false,
        },
        {
          id: 2,
          name: 'Downtown Clinic',
          address: '456 Health Street',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          phone: '+1234567891',
          isActive: true,
          archived: false,
        },
      ];

      mockPrismaService.location.findMany.mockResolvedValue(mockLocations);
      mockPrismaService.location.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10, 'New York', true);

      expect(result).toEqual({
        data: mockLocations,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return empty array when no locations found', async () => {
      mockPrismaService.location.findMany.mockResolvedValue([]);
      mockPrismaService.location.count.mockResolvedValue(0);

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
    it('should return location by id', async () => {
      const mockLocation = {
        id: 1,
        name: 'Main Medical Center',
        address: '123 Medical Drive',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '+1234567890',
        isActive: true,
        archived: false,
      };

      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);

      const result = await service.findOne(1);

      expect(result).toEqual(mockLocation);
      expect(prismaService.location.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException for non-existent location', async () => {
      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update location successfully', async () => {
      const updateLocationDto: UpdateLocationDto = {
        name: 'Updated Medical Center',
        phone: '+1234567891',
      };

      const mockUpdatedLocation = {
        id: 1,
        name: 'Updated Medical Center',
        address: '123 Medical Drive',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '+1234567891',
        isActive: true,
        archived: false,
      };

      mockPrismaService.location.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.location.findFirst.mockResolvedValue(null);
      mockPrismaService.location.update.mockResolvedValue(mockUpdatedLocation);

      const result = await service.update(1, updateLocationDto);

      expect(result).toEqual(mockUpdatedLocation);
      expect(prismaService.location.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateLocationDto,
      });
    });

    it('should throw NotFoundException for non-existent location', async () => {
      const updateLocationDto: UpdateLocationDto = {
        name: 'Updated Medical Center',
      };

      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateLocationDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for name conflict', async () => {
      const updateLocationDto: UpdateLocationDto = {
        name: 'Existing Medical Center',
      };

      mockPrismaService.location.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.location.findFirst.mockResolvedValue({ id: 2 });

      await expect(service.update(1, updateLocationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('archive', () => {
    it('should archive location successfully', async () => {
      const mockArchivedLocation = {
        id: 1,
        name: 'Main Medical Center',
        archived: true,
      };

      mockPrismaService.location.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.location.update.mockResolvedValue(mockArchivedLocation);

      const result = await service.archive(1);

      expect(result).toEqual(mockArchivedLocation);
      expect(prismaService.location.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { archived: true },
      });
    });

    it('should throw NotFoundException for non-existent location', async () => {
      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(service.archive(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore location successfully', async () => {
      const mockRestoredLocation = {
        id: 1,
        name: 'Main Medical Center',
        archived: false,
      };

      mockPrismaService.location.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.location.update.mockResolvedValue(mockRestoredLocation);

      const result = await service.restore(1);

      expect(result).toEqual(mockRestoredLocation);
      expect(prismaService.location.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { archived: false },
      });
    });

    it('should throw NotFoundException for non-existent location', async () => {
      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
    });
  });
});
