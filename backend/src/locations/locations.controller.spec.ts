import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

describe('LocationsController', () => {
  let controller: LocationsController;
  let locationsService: LocationsService;

  const mockLocationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: mockLocationsService,
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
    locationsService = module.get<LocationsService>(LocationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new location', async () => {
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

      mockLocationsService.create.mockResolvedValue(mockCreatedLocation);

      const result = await controller.create(createLocationDto);

      expect(result).toEqual({
        location: mockCreatedLocation,
        message: 'Location created successfully',
      });
      expect(locationsService.create).toHaveBeenCalledWith(createLocationDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated locations with filters', async () => {
      const mockResponse = {
        data: [
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
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockLocationsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 10, 'New York', true);

      expect(result).toEqual(mockResponse);
      expect(locationsService.findAll).toHaveBeenCalledWith(
        1,
        10,
        'New York',
        true,
      );
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

      mockLocationsService.findOne.mockResolvedValue(mockLocation);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        location: mockLocation,
        message: 'Location retrieved successfully',
      });
      expect(locationsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update location', async () => {
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

      mockLocationsService.update.mockResolvedValue(mockUpdatedLocation);

      const result = await controller.update(1, updateLocationDto);

      expect(result).toEqual({
        location: mockUpdatedLocation,
        message: 'Location updated successfully',
      });
      expect(locationsService.update).toHaveBeenCalledWith(
        1,
        updateLocationDto,
      );
    });
  });

  describe('remove', () => {
    it('should archive location', async () => {
      const mockArchivedLocation = {
        id: 1,
        name: 'Main Medical Center',
        archived: true,
      };

      mockLocationsService.archive.mockResolvedValue(mockArchivedLocation);

      const result = await controller.remove(1);

      expect(result).toEqual({
        message: 'Location archived successfully',
      });
      expect(locationsService.archive).toHaveBeenCalledWith(1);
    });
  });
});
