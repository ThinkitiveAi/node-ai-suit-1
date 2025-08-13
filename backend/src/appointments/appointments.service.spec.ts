/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../common/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from './dto/appointment-status.enum';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    appointment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
    },
    location: {
      findUnique: jest.fn(),
    },
    availability: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new appointment successfully', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        date: '2025-12-15T10:00:00Z',
        time: '10:00',
        patientId: 1,
        practiceUserId: 1,
        locationId: 1,
        chiefComplaint: 'Chest pain',
        status: AppointmentStatus.SCHEDULED,
      };

      const mockCreatedAppointment = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        date: new Date('2025-12-15T10:00:00Z'),
        time: '10:00',
        patientId: 1,
        practiceUserId: 1,
        locationId: 1,
        chiefComplaint: 'Chest pain',
        status: AppointmentStatus.SCHEDULED,
        isEmergency: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.patient.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.location.findUnique.mockResolvedValue({ id: 1, isActive: true });
      mockPrismaService.availability.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);
      mockPrismaService.availability.findMany.mockResolvedValue([
        { startTime: '09:00', endTime: '17:00' },
      ]);
      mockPrismaService.appointment.create.mockResolvedValue(mockCreatedAppointment);

      const result = await service.create(createAppointmentDto);

      expect(result).toEqual(mockCreatedAppointment);
      expect(prismaService.appointment.create).toHaveBeenCalledWith({
        data: {
          ...createAppointmentDto,
          date: expect.any(Date),
          status: AppointmentStatus.SCHEDULED,
        },
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              streetAddress: true,
              city: true,
              state: true,
            },
          },
          provider: {
            select: {
              id: true,
              email: true,
              name: true,
              specialty: true,
              phone: true,
              city: true,
              state: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              phone: true,
            },
          },
        },
      });
    });

    it('should throw BadRequestException for past date', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        date: '2020-01-15T10:00:00Z',
        patientId: 1,
        practiceUserId: 1,
      };

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid time format', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        date: '2024-01-15T10:00:00Z',
        time: '25:00',
        patientId: 1,
        practiceUserId: 1,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-existent patient', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        date: '2024-01-15T10:00:00Z',
        patientId: 999,
        practiceUserId: 1,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-existent provider', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        date: '2024-01-15T10:00:00Z',
        patientId: 1,
        practiceUserId: 999,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for duplicate appointment', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        date: '2024-01-15T10:00:00Z',
        patientId: 1,
        practiceUserId: 1,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.appointment.findFirst.mockResolvedValue({ id: 1 });

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated appointments with filters', async () => {
      const mockAppointments = [
        {
          id: 1,
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          date: new Date('2024-01-15T10:00:00Z'),
          time: '10:00',
          patientId: 1,
          practiceUserId: 1,
          status: AppointmentStatus.SCHEDULED,
          isEmergency: false,
        },
        {
          id: 2,
          uuid: '550e8400-e29b-41d4-a716-446655440001',
          date: new Date('2024-01-16T11:00:00Z'),
          time: '11:00',
          patientId: 2,
          practiceUserId: 1,
          status: AppointmentStatus.CONFIRMED,
          isEmergency: false,
        },
      ];

      mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);
      mockPrismaService.appointment.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10, 1, 1, 'Scheduled');

      expect(result).toEqual({
        data: mockAppointments,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return empty array when no appointments found', async () => {
      mockPrismaService.appointment.findMany.mockResolvedValue([]);
      mockPrismaService.appointment.count.mockResolvedValue(0);

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
    it('should return appointment by id', async () => {
      const mockAppointment = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        date: new Date('2024-01-15T10:00:00Z'),
        time: '10:00',
        patientId: 1,
        practiceUserId: 1,
        status: AppointmentStatus.SCHEDULED,
        isEmergency: false,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(mockAppointment);

      const result = await service.findOne(1);

      expect(result).toEqual(mockAppointment);
      expect(prismaService.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              streetAddress: true,
              city: true,
              state: true,
            },
          },
          provider: {
            select: {
              id: true,
              email: true,
              name: true,
              specialty: true,
              phone: true,
              city: true,
              state: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              phone: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException for non-existent appointment', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for patient accessing other patient appointment', async () => {
      const mockAppointment = {
        id: 1,
        patientId: 2,
        practiceUserId: 1,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(mockAppointment);

      await expect(service.findOne(1, 1, 'PATIENT')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for provider accessing other provider appointment', async () => {
      const mockAppointment = {
        id: 1,
        patientId: 1,
        practiceUserId: 2,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(mockAppointment);

      await expect(service.findOne(1, 1, 'PROVIDER')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update appointment successfully', async () => {
      const updateAppointmentDto: UpdateAppointmentDto = {
        time: '11:00',
        chiefComplaint: 'Updated complaint',
      };

      const mockUpdatedAppointment = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        date: new Date('2024-01-15T10:00:00Z'),
        time: '11:00',
        patientId: 1,
        practiceUserId: 1,
        status: AppointmentStatus.SCHEDULED,
        isEmergency: false,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue({
        id: 1,
        patientId: 1,
        practiceUserId: 1,
        status: AppointmentStatus.SCHEDULED,
      });
      mockPrismaService.appointment.update.mockResolvedValue(mockUpdatedAppointment);

      const result = await service.update(1, updateAppointmentDto);

      expect(result).toEqual(mockUpdatedAppointment);
      expect(prismaService.appointment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateAppointmentDto,
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              streetAddress: true,
              city: true,
              state: true,
            },
          },
          provider: {
            select: {
              id: true,
              email: true,
              name: true,
              specialty: true,
              phone: true,
              city: true,
              state: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              phone: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException for non-existent appointment', async () => {
      const updateAppointmentDto: UpdateAppointmentDto = {
        time: '11:00',
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateAppointmentDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const updateAppointmentDto: UpdateAppointmentDto = {
        status: AppointmentStatus.COMPLETED,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue({
        id: 1,
        patientId: 1,
        practiceUserId: 1,
        status: AppointmentStatus.SCHEDULED,
      });

      await expect(service.update(1, updateAppointmentDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete appointment successfully', async () => {
      const mockDeletedAppointment = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue({
        id: 1,
        patientId: 1,
        practiceUserId: 1,
      });
      mockPrismaService.appointment.delete.mockResolvedValue(mockDeletedAppointment);

      const result = await service.remove(1);

      expect(result).toEqual(mockDeletedAppointment);
      expect(prismaService.appointment.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException for non-existent appointment', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update appointment status successfully', async () => {
      const mockUpdatedAppointment = {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        status: AppointmentStatus.CONFIRMED,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue({
        id: 1,
        patientId: 1,
        practiceUserId: 1,
        status: AppointmentStatus.SCHEDULED,
      });
      mockPrismaService.appointment.update.mockResolvedValue(mockUpdatedAppointment);

      const result = await service.updateStatus(1, AppointmentStatus.CONFIRMED);

      expect(result).toEqual(mockUpdatedAppointment);
      expect(prismaService.appointment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: AppointmentStatus.CONFIRMED },
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              streetAddress: true,
              city: true,
              state: true,
            },
          },
          provider: {
            select: {
              id: true,
              email: true,
              name: true,
              specialty: true,
              phone: true,
              city: true,
              state: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              phone: true,
            },
          },
        },
      });
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue({
        id: 1,
        patientId: 1,
        practiceUserId: 1,
        status: AppointmentStatus.SCHEDULED,
      });

      await expect(service.updateStatus(1, AppointmentStatus.COMPLETED)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
}); 