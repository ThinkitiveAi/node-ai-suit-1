/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../common/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

describe('PatientsService', () => {
  let service: PatientsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    patient: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new patient successfully', async () => {
      const createPatientDto: CreatePatientDto = {
        email: 'patient@example.com',
        name: 'Test Patient',
        password: 'password123',
        phone: '+1234567890',
        streetAddress: '123 Test St',
        assignedProviderId: 1,
      };

      const mockCreatedPatient = {
        id: 1,
        email: 'patient@example.com',
        name: 'Test Patient',
        phone: '+1234567890',
        streetAddress: '123 Test St',
        assignedProviderId: 1,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(null);
      mockPrismaService.provider.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.patient.create.mockResolvedValue(mockCreatedPatient);

      const result = await service.create(createPatientDto);

      expect(result).toEqual(mockCreatedPatient);
      expect(prismaService.patient.create).toHaveBeenCalledWith({
        data: {
          ...createPatientDto,
          password: expect.stringMatching(/^\$2b\$10\$/), // Expect bcrypt hash
        },
        include: { assignedProvider: true },
      });
    });

    it('should throw BadRequestException for existing email', async () => {
      const createPatientDto: CreatePatientDto = {
        email: 'existing@example.com',
        name: 'Test Patient',
        password: 'password123',
      };

      mockPrismaService.patient.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(createPatientDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid provider', async () => {
      const createPatientDto: CreatePatientDto = {
        email: 'patient@example.com',
        name: 'Test Patient',
        password: 'password123',
        assignedProviderId: 999,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(null);
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.create(createPatientDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated patients with filters', async () => {
      const mockPatients = [
        {
          id: 1,
          email: 'patient1@example.com',
          name: 'Patient 1',
          phone: '+1234567890',
          streetAddress: '123 Test St',
          assignedProviderId: 1,
          archived: false,
        },
        {
          id: 2,
          email: 'patient2@example.com',
          name: 'Patient 2',
          phone: '+1234567891',
          streetAddress: '456 Test St',
          assignedProviderId: 2,
          archived: false,
        },
      ];

      mockPrismaService.patient.findMany.mockResolvedValue(mockPatients);
      mockPrismaService.patient.count.mockResolvedValue(2);

      const result = await service.findAll(
        1,
        10,
        'Test',
        'patient@example.com',
      );

      expect(result).toEqual({
        data: mockPatients,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return empty array when no patients found', async () => {
      mockPrismaService.patient.findMany.mockResolvedValue([]);
      mockPrismaService.patient.count.mockResolvedValue(0);

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
    it('should return patient by id', async () => {
      const mockPatient = {
        id: 1,
        email: 'patient@example.com',
        name: 'Test Patient',
        phone: '+1234567890',
        streetAddress: '123 Test St',
        assignedProviderId: 1,
        archived: false,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPatient);
      expect(prismaService.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { assignedProvider: true },
      });
    });

    it('should throw NotFoundException for non-existent patient', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update patient successfully', async () => {
      const updatePatientDto: UpdatePatientDto = {
        name: 'Updated Patient',
        phone: '+1234567891',
      };

      const mockUpdatedPatient = {
        id: 1,
        email: 'patient@example.com',
        name: 'Updated Patient',
        phone: '+1234567891',
        streetAddress: '123 Test St',
        assignedProviderId: 1,
        archived: false,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.patient.update.mockResolvedValue(mockUpdatedPatient);

      const result = await service.update(1, updatePatientDto);

      expect(result).toEqual(mockUpdatedPatient);
      expect(prismaService.patient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updatePatientDto,
        include: { assignedProvider: true },
      });
    });

    it('should throw NotFoundException for non-existent patient', async () => {
      const updatePatientDto: UpdatePatientDto = {
        name: 'Updated Patient',
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updatePatientDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('archive', () => {
    it('should archive patient successfully', async () => {
      const mockArchivedPatient = {
        id: 1,
        email: 'patient@example.com',
        name: 'Test Patient',
        archived: true,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.patient.update.mockResolvedValue(mockArchivedPatient);

      const result = await service.archive(1);

      expect(result).toEqual(mockArchivedPatient);
      expect(prismaService.patient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { archived: true },
        include: { assignedProvider: true },
      });
    });

    it('should throw NotFoundException for non-existent patient', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.archive(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore patient successfully', async () => {
      const mockRestoredPatient = {
        id: 1,
        email: 'patient@example.com',
        name: 'Test Patient',
        archived: false,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.patient.update.mockResolvedValue(mockRestoredPatient);

      const result = await service.restore(1);

      expect(result).toEqual(mockRestoredPatient);
      expect(prismaService.patient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { archived: false },
        include: { assignedProvider: true },
      });
    });

    it('should throw NotFoundException for non-existent patient', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should return patient profile', async () => {
      const mockPatient = {
        id: 1,
        email: 'patient@example.com',
        name: 'Test Patient',
        phone: '+1234567890',
        streetAddress: '123 Test St',
        assignedProviderId: 1,
        archived: false,
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);

      const result = await service.getProfile(1);

      expect(result).toEqual(mockPatient);
      expect(prismaService.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          assignedProvider: {
            select: {
              id: true,
              name: true,
              specialty: true,
              phone: true,
              city: true,
              state: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException for non-existent patient', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });
});
