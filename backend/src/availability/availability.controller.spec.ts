/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import {
  CreateAvailabilityDto,
  AvailabilityType,
  DayOfWeek,
  RepeatType,
} from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let availabilityService: AvailabilityService;

  const mockAvailabilityService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    availabilityService = module.get<AvailabilityService>(AvailabilityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new availability slot for provider', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 1, // This will be overridden by the controller
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
        locationId: 1,
      };

      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      const mockResponse = {
        id: 1,
        providerId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
        locationId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: {
          id: 1,
          name: 'Dr. Smith',
          email: 'provider@example.com',
          specialty: 'Cardiology',
        },
        location: {
          id: 1,
          name: 'Main Clinic',
          address: '123 Main St',
          city: 'New York',
        },
      };

      mockAvailabilityService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(createAvailabilityDto, mockRequest as any);

      expect(result).toEqual({
        availability: mockResponse,
        message: 'Availability created successfully',
      });
      expect(availabilityService.create).toHaveBeenCalledWith({
        ...createAvailabilityDto,
        providerId: 1,
      });
    });

    it('should create virtual availability without location', async () => {
      const createAvailabilityDto: CreateAvailabilityDto = {
        providerId: 1,
        availabilityType: AvailabilityType.VIRTUAL,
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: '10:00',
        endTime: '16:00',
        repeatType: RepeatType.WEEKLY_2,
      };

      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      const mockResponse = {
        id: 2,
        providerId: 1,
        availabilityType: AvailabilityType.VIRTUAL,
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: '10:00',
        endTime: '16:00',
        repeatType: RepeatType.WEEKLY_2,
        locationId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: {
          id: 1,
          name: 'Dr. Smith',
          email: 'provider@example.com',
          specialty: 'Cardiology',
        },
        location: null,
      };

      mockAvailabilityService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(
        createAvailabilityDto,
        mockRequest as any,
      );

      expect(result).toEqual({
        availability: mockResponse,
        message: 'Availability created successfully',
      });
      expect(availabilityService.create).toHaveBeenCalledWith({
        ...createAvailabilityDto,
        providerId: 1,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated availability slots for provider', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      const mockResponse = {
        data: [
          {
            id: 1,
            providerId: 1,
            availabilityType: AvailabilityType.OFFLINE,
            dayOfWeek: DayOfWeek.MONDAY,
            startTime: '09:00',
            endTime: '17:00',
            repeatType: RepeatType.NONE,
            locationId: 1,
            isActive: true,
            provider: {
              id: 1,
              name: 'Dr. Smith',
              email: 'provider@example.com',
              specialty: 'Cardiology',
            },
            location: {
              id: 1,
              name: 'Main Clinic',
              address: '123 Main St',
              city: 'New York',
            },
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockAvailabilityService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(
        mockRequest as any,
        1,
        10,
        DayOfWeek.MONDAY,
        true,
      );

      expect(result).toEqual(mockResponse);
      expect(availabilityService.findAll).toHaveBeenCalledWith(
        1,
        10,
        1,
        DayOfWeek.MONDAY,
        true,
      );
    });
  });

  describe('findOne', () => {
    it('should return availability slot by ID for provider', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      const mockResponse = {
        id: 1,
        providerId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
        locationId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: {
          id: 1,
          name: 'Dr. Smith',
          email: 'provider@example.com',
          specialty: 'Cardiology',
        },
        location: {
          id: 1,
          name: 'Main Clinic',
          address: '123 Main St',
          city: 'New York',
        },
      };

      mockAvailabilityService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(1, mockRequest as any);

      expect(result).toEqual({
        availability: mockResponse,
        message: 'Availability retrieved successfully',
      });
      expect(availabilityService.findOne).toHaveBeenCalledWith(1, 1);
    });

    it('should throw ForbiddenException when accessing other provider availability', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      mockAvailabilityService.findOne.mockRejectedValue(
        new ForbiddenException('Cannot modify other provider availability'),
      );

      await expect(controller.findOne(999, mockRequest as any)).rejects.toThrow(
        ForbiddenException,
      );
      expect(availabilityService.findOne).toHaveBeenCalledWith(999, 1);
    });
  });

  describe('update', () => {
    it('should update availability slot for provider', async () => {
      const updateAvailabilityDto: UpdateAvailabilityDto = {
        startTime: '10:00',
        endTime: '18:00',
        isActive: false,
      };

      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      const mockResponse = {
        id: 1,
        providerId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '10:00',
        endTime: '18:00',
        repeatType: RepeatType.NONE,
        locationId: 1,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAvailabilityService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(1, updateAvailabilityDto, mockRequest as any);

      expect(result).toEqual({
        availability: mockResponse,
        message: 'Availability updated successfully',
      });
      expect(availabilityService.update).toHaveBeenCalledWith(
        1,
        updateAvailabilityDto,
        1,
      );
    });

    it('should throw BadRequestException for invalid time format', async () => {
      const updateAvailabilityDto: UpdateAvailabilityDto = {
        startTime: '25:00', // Invalid time
        endTime: '18:00',
      };

      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      mockAvailabilityService.update.mockRejectedValue(
        new BadRequestException('Invalid time format'),
      );

      await expect(
        controller.update(1, updateAvailabilityDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
      expect(availabilityService.update).toHaveBeenCalledWith(
        1,
        updateAvailabilityDto,
        1,
      );
    });
  });

  describe('remove', () => {
    it('should delete availability slot for provider', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      const mockResponse = {
        id: 1,
        providerId: 1,
        availabilityType: AvailabilityType.OFFLINE,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '17:00',
        repeatType: RepeatType.NONE,
        locationId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAvailabilityService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(1, mockRequest as any);

      expect(result).toEqual({
        message: 'Availability deleted successfully',
      });
      expect(availabilityService.remove).toHaveBeenCalledWith(1, 1);
    });

    it('should throw ForbiddenException when deleting other provider availability', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'provider@example.com',
          type: 'provider',
        },
      };

      mockAvailabilityService.remove.mockRejectedValue(
        new ForbiddenException('Cannot modify other provider availability'),
      );

      await expect(controller.remove(999, mockRequest as any)).rejects.toThrow(
        ForbiddenException,
      );
      expect(availabilityService.remove).toHaveBeenCalledWith(999, 1);
    });
  });
});
