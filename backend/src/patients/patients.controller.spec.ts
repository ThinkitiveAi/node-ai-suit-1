import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ForbiddenException } from '@nestjs/common';

describe('PatientsController', () => {
  let controller: PatientsController;
  let patientsService: PatientsService;

  const mockPatientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: mockPatientsService,
        },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    patientsService = module.get<PatientsService>(PatientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onboard', () => {
    it('should create a new patient', async () => {
      const createPatientDto: CreatePatientDto = {
        email: 'patient@example.com',
        name: 'John Doe',
        password: 'StrongP@ssw0rd!',
        phone: '+1234567890',
        streetAddress: '123 Main St, City, State',
      };

      const mockResponse = {
        id: 1,
        email: 'patient@example.com',
        name: 'John Doe',
        phone: '+1234567890',
        streetAddress: '123 Main St, City, State',
        assignedProvider: null,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPatientsService.create.mockResolvedValue(mockResponse);

      const result = await controller.onboard(createPatientDto);

      expect(result).toEqual({
        patient: mockResponse,
        message: 'Patient onboarded successfully',
      });
      expect(patientsService.create).toHaveBeenCalledWith(createPatientDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of patients for providers', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            email: 'patient1@example.com',
            name: 'Patient One',
            phone: '+1234567890',
            assignedProvider: null,
          },
          {
            id: 2,
            email: 'patient2@example.com',
            name: 'Patient Two',
            phone: '+1234567891',
            assignedProvider: null,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockPatientsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 10, 'Patient', 'patient@example.com');

      expect(result).toEqual(mockResponse);
      expect(patientsService.findAll).toHaveBeenCalledWith(1, 10, 'Patient', 'patient@example.com');
    });
  });

  describe('getProfile', () => {
    it('should return current patient profile', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'patient@example.com',
          type: 'patient',
        },
      };

      const mockResponse = {
        id: 1,
        email: 'patient@example.com',
        name: 'John Doe',
        phone: '+1234567890',
        streetAddress: '123 Main St, City, State',
        assignedProvider: {
          id: 1,
          name: 'Dr. Smith',
          specialty: 'Cardiology',
          phone: '+1234567890',
          city: 'New York',
          state: 'NY',
        },
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPatientsService.getProfile.mockResolvedValue(mockResponse);

      const result = await controller.getProfile(mockRequest as any);

      expect(result).toEqual({
        patient: mockResponse,
      });
      expect(patientsService.getProfile).toHaveBeenCalledWith(1);
    });
  });

  describe('updateProfile', () => {
    it('should update current patient profile', async () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'patient@example.com',
          type: 'patient',
        },
      };

      const updatePatientDto: UpdatePatientDto = {
        name: 'John Updated',
        phone: '+1234567891',
        streetAddress: '456 Oak St, City, State',
      };

      const mockResponse = {
        id: 1,
        email: 'patient@example.com',
        name: 'John Updated',
        phone: '+1234567891',
        streetAddress: '456 Oak St, City, State',
        assignedProvider: null,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPatientsService.update.mockResolvedValue(mockResponse);

      const result = await controller.updateProfile(mockRequest as any, updatePatientDto);

      expect(result).toEqual({
        patient: mockResponse,
        message: 'Patient profile updated successfully',
      });
      expect(patientsService.update).toHaveBeenCalledWith(1, updatePatientDto);
    });
  });

  describe('findOne', () => {
    it('should return patient by ID for providers', async () => {
      const mockResponse = {
        id: 1,
        email: 'patient@example.com',
        name: 'John Doe',
        phone: '+1234567890',
        streetAddress: '123 Main St, City, State',
        assignedProvider: null,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPatientsService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        patient: mockResponse,
      });
      expect(patientsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should archive patient by ID for providers', async () => {
      const mockResponse = {
        id: 1,
        email: 'patient@example.com',
        name: 'John Doe',
        phone: '+1234567890',
        streetAddress: '123 Main St, City, State',
        assignedProvider: null,
        archived: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPatientsService.archive.mockResolvedValue(mockResponse);

      const result = await controller.remove(1);

      expect(result).toEqual({
        message: 'Patient archived successfully',
      });
      expect(patientsService.archive).toHaveBeenCalledWith(1);
    });
  });
});
