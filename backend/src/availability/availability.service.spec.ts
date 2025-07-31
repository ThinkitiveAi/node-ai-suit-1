import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../common/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CreateAvailabilityDto,
  AvailabilityType,
  DayOfWeek,
  RepeatType,
} from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    availability: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
    },
    location: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new availability successfully', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 1,
        locationId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
      };

      const mockCreatedAvailability = {
        id: 1,
        ...createAvailabilityDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.availability.findMany.mockResolvedValue([]);
      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.location.findUnique.mockResolvedValue({ id: 1, isActive: true });
      mockPrismaService.availability.create.mockResolvedValue(
        mockCreatedAvailability,
      );

      const result = await service.create(createAvailabilityDto);

      expect(result).toEqual(mockCreatedAvailability);
      expect(prismaService.availability.create).toHaveBeenCalledWith({
        data: createAvailabilityDto,
      });
    });

    it('should throw BadRequestException for invalid time format', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 1,
        locationId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '25:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
      };

      await expect(service.create(createAvailabilityDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid time range', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 1,
        locationId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '17:00',
        endTime: '09:00',
        repeatType: RepeatType.NONE,
      };

      await expect(service.create(createAvailabilityDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for offline availability without location', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
      };

      await expect(service.create(createAvailabilityDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for slot overlap', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 1,
        locationId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
      };

      const existingSlot = {
        id: 1,
        providerId: 1,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '10:00',
        endTime: '16:00',
        isActive: true,
      };

      mockPrismaService.availability.findMany.mockResolvedValue([existingSlot]);

      await expect(service.create(createAvailabilityDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-existent provider', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 999,
        locationId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
      };

      mockPrismaService.availability.findMany.mockResolvedValue([]);
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.create(createAvailabilityDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-existent location', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 1,
        locationId: 999,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
      };

      mockPrismaService.availability.findMany.mockResolvedValue([]);
      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(service.create(createAvailabilityDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated availability with filters', async () => {
      const mockAvailabilities = [
        {
          id: 1,
          providerId: 1,
          locationId: 1,
          availabilityType: AvailabilityType.OFFLINE,
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '09:00',
          endTime: '17:00',
          repeatType: RepeatType.NONE,
          isActive: true,
          provider: {
            id: 1,
            name: 'Dr. Test Provider',
            email: 'provider@example.com',
            specialty: 'Cardiology',
          },
          location: {
            id: 1,
            name: 'Main Medical Center',
            address: '123 Medical Drive',
            city: 'New York',
          },
        },
      ];

      mockPrismaService.availability.findMany.mockResolvedValue(
        mockAvailabilities,
      );
      mockPrismaService.availability.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, 1, 'MONDAY', true);

      expect(result).toEqual({
        data: mockAvailabilities,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should return empty array when no availability found', async () => {
      mockPrismaService.availability.findMany.mockResolvedValue([]);
      mockPrismaService.availability.count.mockResolvedValue(0);

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
    it('should return availability by id', async () => {
      const mockAvailability = {
        id: 1,
        providerId: 1,
        locationId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
        isActive: true,
        provider: {
          id: 1,
          name: 'Dr. Test Provider',
          email: 'provider@example.com',
          specialty: 'Cardiology',
        },
        location: {
          id: 1,
          name: 'Main Medical Center',
          address: '123 Medical Drive',
          city: 'New York',
        },
      };

      mockPrismaService.availability.findUnique.mockResolvedValue(
        mockAvailability,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(mockAvailability);
      expect(prismaService.availability.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              specialty: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException for non-existent availability', async () => {
      mockPrismaService.availability.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update availability successfully', async () => {
      const updateAvailabilityDto: UpdateAvailabilityDto = {
        startTime: '10:00',
        endTime: '18:00',
      };

      const mockUpdatedAvailability = {
        id: 1,
        providerId: 1,
        locationId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '10:00',
        endTime: '18:00',
        repeatType: RepeatType.NONE,
        isActive: true,
      };

      mockPrismaService.availability.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.availability.findMany.mockResolvedValue([]);
      mockPrismaService.availability.update.mockResolvedValue(
        mockUpdatedAvailability,
      );

      const result = await service.update(1, updateAvailabilityDto);

      expect(result).toEqual(mockUpdatedAvailability);
      expect(prismaService.availability.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateAvailabilityDto,
      });
    });

    it('should throw NotFoundException for non-existent availability', async () => {
      const updateAvailabilityDto: UpdateAvailabilityDto = {
        startTime: '10:00',
      };

      mockPrismaService.availability.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateAvailabilityDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid time format', async () => {
      const updateAvailabilityDto: UpdateAvailabilityDto = {
        startTime: '25:00',
      };

      mockPrismaService.availability.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.update(1, updateAvailabilityDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for slot overlap', async () => {
      const updateAvailabilityDto: UpdateAvailabilityDto = {
        startTime: '10:00',
        endTime: '18:00',
      };

      const existingSlot = {
        id: 2,
        providerId: 1,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '11:00',
        endTime: '16:00',
        isActive: true,
      };

      mockPrismaService.availability.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.availability.findMany.mockResolvedValue([existingSlot]);

      await expect(service.update(1, updateAvailabilityDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete availability successfully', async () => {
      const mockDeletedAvailability = {
        id: 1,
        providerId: 1,
        locationId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
        isActive: true,
      };

      mockPrismaService.availability.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.availability.delete.mockResolvedValue(
        mockDeletedAvailability,
      );

      const result = await service.remove(1);

      expect(result).toEqual(mockDeletedAvailability);
      expect(prismaService.availability.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException for non-existent availability', async () => {
      mockPrismaService.availability.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
