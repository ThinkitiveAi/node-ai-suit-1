/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAvailabilityDto, AvailabilityType, DayOfWeek, RepeatType } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { errorMessages } from '../common/errors/error-messages';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(private readonly prisma: PrismaService) {}

  private validateTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private validateTimeRange(startTime: string, endTime: string): boolean {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return start < end;
  }

  private async checkSlotOverlap(
    providerId: number,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    availabilityType: string,
    locationId?: number,
    excludeId?: number,
  ): Promise<boolean> {
    const where: any = {
      providerId,
      dayOfWeek,
      isActive: true,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    // For offline availability, check overlap with other offline availabilities at the same location
    if (availabilityType === 'OFFLINE' && locationId) {
      where.availabilityType = 'OFFLINE';
      where.locationId = locationId;
    }
    // For virtual availability, check overlap with all other virtual availabilities
    else if (availabilityType === 'VIRTUAL') {
      where.availabilityType = 'VIRTUAL';
      // Virtual availability can overlap with offline, but not with other virtual
    }

    const existingSlots = await this.prisma.availability.findMany({ where });

    for (const slot of existingSlots) {
      const existingStart = new Date(`2000-01-01T${slot.startTime}:00`);
      const existingEnd = new Date(`2000-01-01T${slot.endTime}:00`);
      const newStart = new Date(`2000-01-01T${startTime}:00`);
      const newEnd = new Date(`2000-01-01T${endTime}:00`);

      // Check for overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }

    return false;
  }

  async create(createAvailabilityDto: CreateAvailabilityDto) {
    try {
      this.logger.log('Creating availability', createAvailabilityDto);

      // Validate time format
      if (
        !this.validateTimeFormat(createAvailabilityDto.startTime) ||
        !this.validateTimeFormat(createAvailabilityDto.endTime)
      ) {
        throw new BadRequestException(errorMessages.availability.INVALID_TIME);
      }

      // Validate time range
      if (
        !this.validateTimeRange(
          createAvailabilityDto.startTime,
          createAvailabilityDto.endTime,
        )
      ) {
        throw new BadRequestException(errorMessages.availability.END_TIME_BEFORE_START);
      }

      // Check for offline availability location requirement
      if (
        createAvailabilityDto.availabilityType === 'OFFLINE' &&
        !createAvailabilityDto.locationId
      ) {
        throw new BadRequestException(
          errorMessages.availability.OFFLINE_REQUIRES_LOCATION,
        );
      }

      // Check for virtual availability location restriction
      if (
        createAvailabilityDto.availabilityType === 'VIRTUAL' &&
        createAvailabilityDto.locationId
      ) {
        throw new BadRequestException(
          errorMessages.availability.VIRTUAL_NO_LOCATION,
        );
      }

      // Validate provider exists
      const provider = await this.prisma.provider.findUnique({
        where: { id: createAvailabilityDto.providerId },
      });
      if (!provider) {
        throw new BadRequestException('Provider not found');
      }

      // Validate location exists and is active if provided
      if (createAvailabilityDto.locationId) {
        const location = await this.prisma.location.findUnique({
          where: { id: createAvailabilityDto.locationId },
        });
        if (!location) {
          throw new BadRequestException('Location not found');
        }
        if (!location.isActive) {
          throw new BadRequestException(errorMessages.locations.INACTIVE_LOCATION);
        }
      }

      // Check for slot overlap based on availability type
      const hasOverlap = await this.checkSlotOverlap(
        createAvailabilityDto.providerId,
        createAvailabilityDto.dayOfWeek,
        createAvailabilityDto.startTime,
        createAvailabilityDto.endTime,
        createAvailabilityDto.availabilityType,
        createAvailabilityDto.locationId,
      );

      if (hasOverlap) {
        throw new BadRequestException(
          errorMessages.availability.OVERLAP_CONFLICT,
        );
      }

      const createdAvailability = await this.prisma.availability.create({ data: createAvailabilityDto });
      
      // Cast enum values to proper types
      return {
        ...createdAvailability,
        availabilityType: createdAvailability.availabilityType as AvailabilityType,
        dayOfWeek: createdAvailability.dayOfWeek as DayOfWeek,
        repeatType: createdAvailability.repeatType as RepeatType,
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error creating availability',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create availability');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    providerId?: number,
    dayOfWeek?: string,
    isActive?: boolean,
  ) {
    try {
      this.logger.log('Fetching availability with filters', {
        page,
        limit,
        providerId,
        dayOfWeek,
        isActive,
      });
      const skip = (page - 1) * limit;
      const where: {
        providerId?: number;
        dayOfWeek?: any;
        isActive?: boolean;
      } = {};

      if (providerId) where.providerId = providerId;
      if (dayOfWeek) where.dayOfWeek = dayOfWeek;
      if (isActive !== undefined) where.isActive = isActive;

      const [availabilities, total] = await Promise.all([
        this.prisma.availability.findMany({
          where,
          skip,
          take: limit,
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
        }),
        this.prisma.availability.count({ where }),
      ]);

      // Cast enum values to proper types
      const typedAvailabilities = availabilities.map(availability => ({
        ...availability,
        availabilityType: availability.availabilityType as AvailabilityType,
        dayOfWeek: availability.dayOfWeek as DayOfWeek,
        repeatType: availability.repeatType as RepeatType,
      }));

      return {
        data: typedAvailabilities,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching availability',
        (error as Error).stack || (error as Error).message,
      );
      throw new InternalServerErrorException('Failed to fetch availability');
    }
  }

  async findOne(id: number, providerId?: number) {
    try {
      this.logger.log(`Fetching availability with id ${id}`);
      const where: any = { id };
      
      // If providerId is provided, ensure the availability belongs to that provider
      if (providerId) {
        where.providerId = providerId;
      }

      const availability = await this.prisma.availability.findUnique({
        where,
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
      
      if (!availability) {
        if (providerId) {
          throw new ForbiddenException(errorMessages.availability.CANNOT_MODIFY_OTHER_PROVIDER);
        }
        throw new NotFoundException(errorMessages.availability.NOT_FOUND);
      }
      
      // Cast enum values to proper types
      return {
        ...availability,
        availabilityType: availability.availabilityType as AvailabilityType,
        dayOfWeek: availability.dayOfWeek as DayOfWeek,
        repeatType: availability.repeatType as RepeatType,
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching availability',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Failed to fetch availability');
    }
  }

  async update(id: number, updateAvailabilityDto: UpdateAvailabilityDto, providerId?: number) {
    try {
      this.logger.log(
        `Updating availability with id ${id}`,
        updateAvailabilityDto,
      );
      
      const where: any = { id };
      if (providerId) {
        where.providerId = providerId;
      }
      
      const availability = await this.prisma.availability.findUnique({
        where,
      });
      
      if (!availability) {
        if (providerId) {
          throw new ForbiddenException(errorMessages.availability.CANNOT_MODIFY_OTHER_PROVIDER);
        }
        throw new NotFoundException(errorMessages.availability.NOT_FOUND);
      }

      // Validate time format if provided
      if (
        updateAvailabilityDto.startTime &&
        !this.validateTimeFormat(updateAvailabilityDto.startTime)
      ) {
        throw new BadRequestException(errorMessages.availability.INVALID_TIME);
      }
      if (
        updateAvailabilityDto.endTime &&
        !this.validateTimeFormat(updateAvailabilityDto.endTime)
      ) {
        throw new BadRequestException(errorMessages.availability.INVALID_TIME);
      }

      // Validate time range if both times are provided
      if (updateAvailabilityDto.startTime && updateAvailabilityDto.endTime) {
        if (
          !this.validateTimeRange(
            updateAvailabilityDto.startTime,
            updateAvailabilityDto.endTime,
          )
        ) {
          throw new BadRequestException(errorMessages.availability.END_TIME_BEFORE_START);
        }
      }

      // Validate location requirements
      const newAvailabilityType = updateAvailabilityDto.availabilityType || availability.availabilityType;
      const newLocationId = updateAvailabilityDto.locationId || availability.locationId;

      if (newAvailabilityType === 'OFFLINE' && !newLocationId) {
        throw new BadRequestException(errorMessages.availability.OFFLINE_REQUIRES_LOCATION);
      }

      if (newAvailabilityType === 'VIRTUAL' && newLocationId) {
        throw new BadRequestException(errorMessages.availability.VIRTUAL_NO_LOCATION);
      }

      // Validate location exists and is active if provided
      if (newLocationId) {
        const location = await this.prisma.location.findUnique({
          where: { id: newLocationId },
        });
        if (!location) {
          throw new BadRequestException('Location not found');
        }
        if (!location.isActive) {
          throw new BadRequestException(errorMessages.locations.INACTIVE_LOCATION);
        }
      }

      // Check for slot overlap if times are being updated
      if (updateAvailabilityDto.startTime || updateAvailabilityDto.endTime) {
        const startTime =
          updateAvailabilityDto.startTime || availability.startTime;
        const endTime = updateAvailabilityDto.endTime || availability.endTime;
        const dayOfWeek =
          updateAvailabilityDto.dayOfWeek || availability.dayOfWeek;
        const availabilityType =
          updateAvailabilityDto.availabilityType ||
          availability.availabilityType;
        const locationId =
          updateAvailabilityDto.locationId || availability.locationId;

        const hasOverlap = await this.checkSlotOverlap(
          availability.providerId,
          dayOfWeek,
          startTime,
          endTime,
          availabilityType,
          locationId as number | undefined,
          id,
        );

        if (hasOverlap) {
          throw new BadRequestException(
            errorMessages.availability.OVERLAP_CONFLICT,
          );
        }
      }

      const updatedAvailability = await this.prisma.availability.update({
        where: { id },
        data: updateAvailabilityDto,
      });

      // Cast enum values to proper types
      return {
        ...updatedAvailability,
        availabilityType: updatedAvailability.availabilityType as AvailabilityType,
        dayOfWeek: updatedAvailability.dayOfWeek as DayOfWeek,
        repeatType: updatedAvailability.repeatType as RepeatType,
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error updating availability',
        (error as Error).stack || (error as Error).message,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new InternalServerErrorException('Failed to update availability');
    }
  }

  async remove(id: number, providerId?: number) {
    try {
      this.logger.log(`Deleting availability with id ${id}`);
      
      const where: any = { id };
      if (providerId) {
        where.providerId = providerId;
      }
      
      const availability = await this.prisma.availability.findUnique({
        where,
      });
      
      if (!availability) {
        if (providerId) {
          throw new ForbiddenException(errorMessages.availability.CANNOT_MODIFY_OTHER_PROVIDER);
        }
        throw new NotFoundException(errorMessages.availability.NOT_FOUND);
      }
      
      return this.prisma.availability.delete({ where: { id } });
    } catch (error: unknown) {
      this.logger.error(
        'Error deleting availability',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Failed to delete availability');
    }
  }
}
