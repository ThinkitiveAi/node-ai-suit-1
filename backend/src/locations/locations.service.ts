import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { errorMessages } from '../common/errors/error-messages';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    try {
      this.logger.log('Creating location', createLocationDto);

      // Check for existing location with same name and city
      const existing = await this.prisma.location.findFirst({
        where: {
          name: createLocationDto.name,
          city: createLocationDto.city,
          archived: false,
        },
      });
      if (existing) {
        throw new BadRequestException(errorMessages.locations.NAME_EXISTS);
      }

      // Validate required fields
      if (
        !createLocationDto.name ||
        !createLocationDto.address ||
        !createLocationDto.city ||
        !createLocationDto.state
      ) {
        throw new BadRequestException(errorMessages.locations.REQUIRED_FIELDS);
      }

      // Validate zip code format if provided
      if (
        createLocationDto.zipCode &&
        !/^\d{5}(-\d{4})?$/.test(createLocationDto.zipCode)
      ) {
        throw new BadRequestException(errorMessages.locations.INVALID_ZIP_CODE);
      }

      return this.prisma.location.create({ data: createLocationDto });
    } catch (error: unknown) {
      this.logger.error(
        'Error creating location',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create location');
    }
  }

  async findAll(page = 1, limit = 10, city?: string, isActive?: boolean) {
    try {
      this.logger.log('Fetching locations with filters', {
        page,
        limit,
        city,
        isActive,
      });
      const skip = (page - 1) * limit;
      const where: {
        archived: boolean;
        city?: { contains: string; mode: 'insensitive' };
        isActive?: boolean;
        providerId?: number;
      } = { archived: false };

      if (city) where.city = { contains: city, mode: 'insensitive' };
      if (isActive !== undefined) where.isActive = isActive;

      const [locations, total] = await Promise.all([
        this.prisma.location.findMany({
          where,
          skip,
          take: limit,
        }),
        this.prisma.location.count({ where }),
      ]);

      return {
        data: locations,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching locations',
        (error as Error).stack || (error as Error).message,
      );
      throw new InternalServerErrorException('Failed to fetch locations');
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log(`Fetching location with id ${id}`);
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location)
        throw new NotFoundException(errorMessages.locations.NOT_FOUND);
      return location;
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching location',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch location');
    }
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    try {
      this.logger.log(`Updating location with id ${id}`, updateLocationDto);
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location)
        throw new NotFoundException(errorMessages.locations.NOT_FOUND);

      // Check for name conflicts if name is being updated
      if (updateLocationDto.name) {
        const existing = await this.prisma.location.findFirst({
          where: {
            name: updateLocationDto.name,
            city: updateLocationDto.city || location.city,
            archived: false,
            id: { not: id },
          },
        });
        if (existing) {
          throw new BadRequestException(errorMessages.locations.NAME_EXISTS);
        }
      }

      // Validate zip code format if provided
      if (
        updateLocationDto.zipCode &&
        !/^\d{5}(-\d{4})?$/.test(updateLocationDto.zipCode)
      ) {
        throw new BadRequestException(errorMessages.locations.INVALID_ZIP_CODE);
      }

      return this.prisma.location.update({
        where: { id },
        data: updateLocationDto,
      });
    } catch (error: unknown) {
      this.logger.error(
        'Error updating location',
        (error as Error).stack || (error as Error).message,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Failed to update location');
    }
  }

  async archive(id: number) {
    try {
      this.logger.log(`Archiving location with id ${id}`);
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location)
        throw new NotFoundException(errorMessages.locations.NOT_FOUND);
      return this.prisma.location.update({
        where: { id },
        data: { archived: true },
      });
    } catch (error: unknown) {
      this.logger.error(
        'Error archiving location',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to archive location');
    }
  }

  async restore(id: number) {
    try {
      this.logger.log(`Restoring location with id ${id}`);
      const location = await this.prisma.location.findUnique({ where: { id } });
      if (!location)
        throw new NotFoundException(errorMessages.locations.NOT_FOUND);
      return this.prisma.location.update({
        where: { id },
        data: { archived: false },
      });
    } catch (error: unknown) {
      this.logger.error(
        'Error restoring location',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to restore location');
    }
  }
}
