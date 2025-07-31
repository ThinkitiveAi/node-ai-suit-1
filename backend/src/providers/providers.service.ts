/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { errorMessages } from '../common/errors/error-messages';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createProviderDto: CreateProviderDto) {
    try {
      this.logger.log('Creating provider', createProviderDto);

      // Check if email already exists for any provider
      const existingProvider = await this.prisma.provider.findUnique({
        where: { email: createProviderDto.email },
      });

      if (existingProvider) {
        throw new BadRequestException(errorMessages.providers.EMAIL_EXISTS);
      }

      const provider = await this.prisma.provider.create({
        data: {
          ...createProviderDto,
          password: bcrypt.hashSync(createProviderDto.password, 10),
        },
      });

      // Remove password from response
      const { password: _, ...providerData } = provider;
      return providerData;
    } catch (error: unknown) {
      this.logger.error(
        'Error creating provider',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create provider');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    specialty?: string,
    city?: string,
    name?: string,
    email?: string,
  ) {
    try {
      this.logger.log('Fetching providers with filters', {
        page,
        limit,
        specialty,
        city,
        name,
        email,
      });
      const skip = (page - 1) * limit;
      const where: {
        archived: boolean;
        specialty?: { contains: string; mode: 'insensitive' };
        city?: { contains: string; mode: 'insensitive' };
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      } = { archived: false };

      if (specialty) {
        where.specialty = { contains: specialty, mode: 'insensitive' };
      }
      if (city) {
        where.city = { contains: city, mode: 'insensitive' };
      }
      if (name) {
        where.name = { contains: name, mode: 'insensitive' };
      }
      if (email) {
        where.email = { contains: email, mode: 'insensitive' };
      }

      const [providers, total] = await Promise.all([
        this.prisma.provider.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            specialty: true,
            city: true,
            state: true,
            roleId: true,
            archived: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.provider.count({ where }),
      ]);

      return {
        data: providers,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching providers',
        (error as Error).stack || (error as Error).message,
      );
      throw new InternalServerErrorException('Failed to fetch providers');
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log(`Fetching provider with id ${id}`);
      const provider = await this.prisma.provider.findUnique({ where: { id } });
      if (!provider) {
        throw new NotFoundException(errorMessages.providers.NOT_FOUND);
      }

      // Remove password from provider
      const { password: _, ...providerData } = provider;
      return providerData;
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching provider',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch provider');
    }
  }

  async update(id: number, updateProviderDto: UpdateProviderDto) {
    try {
      this.logger.log(`Updating provider with id ${id}`, updateProviderDto);
      const provider = await this.prisma.provider.findUnique({ where: { id } });
      if (!provider) {
        throw new NotFoundException(errorMessages.providers.NOT_FOUND);
      }

      const updatedProvider = await this.prisma.provider.update({
        where: { id },
        data: updateProviderDto,
      });

      // Remove password from response
      const { password: _, ...providerData } = updatedProvider;
      return providerData;
    } catch (error: unknown) {
      this.logger.error(
        'Error updating provider',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update provider');
    }
  }

  async archive(id: number) {
    try {
      this.logger.log(`Archiving provider with id ${id}`);
      const provider = await this.prisma.provider.findUnique({ where: { id } });
      if (!provider) {
        throw new NotFoundException(errorMessages.providers.NOT_FOUND);
      }

      const archivedProvider = await this.prisma.provider.update({
        where: { id },
        data: { archived: true },
      });

      // Remove password from response
      const { password: _, ...providerData } = archivedProvider;
      return providerData;
    } catch (error: unknown) {
      this.logger.error(
        'Error archiving provider',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to archive provider');
    }
  }

  async restore(id: number) {
    try {
      this.logger.log(`Restoring provider with id ${id}`);
      const provider = await this.prisma.provider.findUnique({ where: { id } });
      if (!provider) {
        throw new NotFoundException(errorMessages.providers.NOT_FOUND);
      }

      const restoredProvider = await this.prisma.provider.update({
        where: { id },
        data: { archived: false },
      });

      // Remove password from response
      const { password: _, ...providerData } = restoredProvider;
      return providerData;
    } catch (error: unknown) {
      this.logger.error(
        'Error restoring provider',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to restore provider');
    }
  }

  async getProfile(userId: number) {
    try {
      this.logger.log(`Getting profile for provider ${userId}`);
      const provider = await this.prisma.provider.findUnique({
        where: { id: userId },
      });
      if (!provider) {
        throw new NotFoundException(errorMessages.providers.NOT_FOUND);
      }

      // Remove password from provider
      const { password: _, ...providerData } = provider;
      return providerData;
    } catch (error: unknown) {
      this.logger.error(
        'Error getting provider profile',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to get provider profile');
    }
  }
}
