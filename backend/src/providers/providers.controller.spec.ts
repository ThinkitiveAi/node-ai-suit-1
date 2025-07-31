import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

describe('ProvidersController', () => {
  let controller: ProvidersController;
  let providersService: ProvidersService;

  const mockProvidersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [
        {
          provide: ProvidersService,
          useValue: mockProvidersService,
        },
      ],
    }).compile();

    controller = module.get<ProvidersController>(ProvidersController);
    providersService = module.get<ProvidersService>(ProvidersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onboard', () => {
    it('should create a new provider', async () => {
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

      mockProvidersService.create.mockResolvedValue(mockCreatedProvider);

      const result = await controller.onboard(createProviderDto);

      expect(result).toEqual({
        provider: mockCreatedProvider,
        message: 'Provider onboarded successfully',
      });
      expect(providersService.create).toHaveBeenCalledWith(createProviderDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated providers with filters', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            email: 'provider1@example.com',
            name: 'Dr. Provider 1',
            phone: '+1234567890',
            specialty: 'Cardiology',
            city: 'New York',
            state: 'NY',
            archived: false,
          },
          {
            id: 2,
            email: 'provider2@example.com',
            name: 'Dr. Provider 2',
            phone: '+1234567891',
            specialty: 'Neurology',
            city: 'Los Angeles',
            state: 'CA',
            archived: false,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockProvidersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(
        1,
        10,
        'Cardiology',
        'New York',
        'Dr. Provider',
        'provider@example.com',
      );

      expect(result).toEqual(mockResponse);
      expect(providersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        'Cardiology',
        'New York',
        'Dr. Provider',
        'provider@example.com',
      );
    });
  });

  describe('getProfile', () => {
    it('should return provider profile', async () => {
      const mockProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
      };

      const mockRequest = {
        user: { id: 1, email: 'provider@example.com' },
        headers: {},
        method: 'GET',
        url: '/providers/me',
        body: {},
        params: {},
        query: {},
      };

      mockProvidersService.getProfile.mockResolvedValue(mockProvider);

      const result = await controller.getProfile(mockRequest as any);

      expect(result).toEqual({
        provider: mockProvider,
      });
      expect(providersService.getProfile).toHaveBeenCalledWith(1);
    });
  });

  describe('updateProfile', () => {
    it('should update provider profile', async () => {
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

      const mockRequest = {
        user: { id: 1, email: 'provider@example.com' },
        headers: {},
        method: 'PATCH',
        url: '/providers/me',
        body: updateProviderDto,
        params: {},
        query: {},
      };

      mockProvidersService.update.mockResolvedValue(mockUpdatedProvider);

      const result = await controller.updateProfile(
        mockRequest as any,
        updateProviderDto,
      );

      expect(result).toEqual({
        provider: mockUpdatedProvider,
        message: 'Provider profile updated successfully',
      });
      expect(providersService.update).toHaveBeenCalledWith(
        1,
        updateProviderDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return provider by id', async () => {
      const mockProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        phone: '+1234567890',
        specialty: 'Cardiology',
        city: 'New York',
        state: 'NY',
        archived: false,
      };

      mockProvidersService.findOne.mockResolvedValue(mockProvider);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        provider: mockProvider,
      });
      expect(providersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should archive provider', async () => {
      const mockArchivedProvider = {
        id: 1,
        email: 'provider@example.com',
        name: 'Dr. Test Provider',
        archived: true,
      };

      mockProvidersService.archive.mockResolvedValue(mockArchivedProvider);

      const result = await controller.remove(1);

      expect(result).toEqual({
        message: 'Provider archived successfully',
      });
      expect(providersService.archive).toHaveBeenCalledWith(1);
    });
  });
});
