/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { errorMessages } from '../common/errors/error-messages';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private parsePatientData(patient: any) {
    const { password: _, ...patientData } = patient;

    // Remove password from assignedProvider if it exists
    if (patientData.assignedProvider) {
      const { password: __, ...providerData } = patientData.assignedProvider;
      patientData.assignedProvider = providerData;
    }

    return patientData;
  }

  async create(createPatientDto: CreatePatientDto) {
    try {
      this.logger.log('Creating patient', createPatientDto);

      // Check if email already exists for any patient
      const existingPatient = await this.prisma.patient.findUnique({
        where: { email: createPatientDto.email },
      });

      if (existingPatient) {
        throw new BadRequestException(errorMessages.patients.EMAIL_EXISTS);
      }

      // Also check if email exists in providers table
      const existingProvider = await this.prisma.provider.findUnique({
        where: { email: createPatientDto.email },
      });

      if (existingProvider) {
        throw new BadRequestException(errorMessages.patients.EMAIL_EXISTS);
      }

      // Validate assignedProviderId if present
      if (createPatientDto.assignedProviderId) {
        const provider = await this.prisma.provider.findUnique({
          where: { id: createPatientDto.assignedProviderId },
        });
        if (!provider) {
          throw new BadRequestException(
            errorMessages.patients.INVALID_PROVIDER,
          );
        }
      }

      const patient = await this.prisma.patient.create({
        data: {
          ...createPatientDto,
          password: bcrypt.hashSync(createPatientDto.password, 10),
          dateOfBirth: createPatientDto.dateOfBirth
            ? new Date(createPatientDto.dateOfBirth)
            : null,
          emergencyContact: createPatientDto.emergencyContact
            ? (createPatientDto.emergencyContact as any)
            : undefined,
        },
        include: { assignedProvider: true },
      });

      return this.parsePatientData(patient);
    } catch (error: unknown) {
      this.logger.error(
        'Error creating patient',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create patient');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    name?: string,
    email?: string,
    assignedProviderId?: number,
  ) {
    try {
      this.logger.log('Fetching patients with filters', {
        page,
        limit,
        name,
        email,
        assignedProviderId,
      });
      const skip = (page - 1) * limit;
      const where: {
        archived: boolean;
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
        assignedProviderId?: number;
      } = { archived: false };

      if (name) where.name = { contains: name, mode: 'insensitive' };
      if (email) where.email = { contains: email, mode: 'insensitive' };
      if (assignedProviderId) where.assignedProviderId = assignedProviderId;

      const [patients, total] = await Promise.all([
        this.prisma.patient.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            streetAddress: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            dateOfBirth: true,
            gender: true,
            emergencyContact: true,
            assignedProvider: {
              select: {
                id: true,
                name: true,
                specialty: true,
                city: true,
                state: true,
              },
            },
            archived: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.patient.count({ where }),
      ]);

      return {
        data: patients.map((patient) => this.parsePatientData(patient)),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching patients',
        (error as Error).stack || (error as Error).message,
      );
      throw new InternalServerErrorException('Failed to fetch patients');
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log(`Fetching patient with id ${id}`);
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        include: { assignedProvider: true },
      });
      if (!patient) {
        throw new NotFoundException(errorMessages.patients.NOT_FOUND);
      }

      return this.parsePatientData(patient);
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching patient',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch patient');
    }
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    try {
      this.logger.log(`Updating patient with id ${id}`, updatePatientDto);
      const patient = await this.prisma.patient.findUnique({ where: { id } });
      if (!patient) {
        throw new NotFoundException(errorMessages.patients.NOT_FOUND);
      }

      // Check for email uniqueness if email is being updated
      if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
        const existingPatient = await this.prisma.patient.findUnique({
          where: { email: updatePatientDto.email },
        });
        if (existingPatient) {
          throw new BadRequestException(errorMessages.patients.EMAIL_EXISTS);
        }

        // Also check if email exists in providers table
        const existingProvider = await this.prisma.provider.findUnique({
          where: { email: updatePatientDto.email },
        });
        if (existingProvider) {
          throw new BadRequestException(errorMessages.patients.EMAIL_EXISTS);
        }
      }

      // Validate assignedProviderId if present
      if (updatePatientDto.assignedProviderId) {
        const provider = await this.prisma.provider.findUnique({
          where: { id: updatePatientDto.assignedProviderId },
        });
        if (!provider) {
          throw new BadRequestException(
            errorMessages.patients.INVALID_PROVIDER,
          );
        }
      }

      // Hash password if it's being updated
      const updateData: any = { ...updatePatientDto };
      if (updatePatientDto.password) {
        updateData.password = bcrypt.hashSync(updatePatientDto.password, 10);
      }

      const updatedPatient = await this.prisma.patient.update({
        where: { id },
        data: {
          ...updateData,
          dateOfBirth: updatePatientDto.dateOfBirth
            ? new Date(updatePatientDto.dateOfBirth)
            : undefined,
          emergencyContact: updatePatientDto.emergencyContact
            ? (updatePatientDto.emergencyContact as any)
            : undefined,
        },
        include: { assignedProvider: true },
      });

      return this.parsePatientData(updatedPatient);
    } catch (error: unknown) {
      this.logger.error(
        'Error updating patient',
        (error as Error).stack || (error as Error).message,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Failed to update patient');
    }
  }

  async archive(id: number) {
    try {
      this.logger.log(`Archiving patient with id ${id}`);
      const patient = await this.prisma.patient.findUnique({ where: { id } });
      if (!patient) {
        throw new NotFoundException(errorMessages.patients.NOT_FOUND);
      }

      const archivedPatient = await this.prisma.patient.update({
        where: { id },
        data: { archived: true },
        include: { assignedProvider: true },
      });

      return this.parsePatientData(archivedPatient);
    } catch (error: unknown) {
      this.logger.error(
        'Error archiving patient',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to archive patient');
    }
  }

  async restore(id: number) {
    try {
      this.logger.log(`Restoring patient with id ${id}`);
      const patient = await this.prisma.patient.findUnique({ where: { id } });
      if (!patient) {
        throw new NotFoundException(errorMessages.patients.NOT_FOUND);
      }

      const restoredPatient = await this.prisma.patient.update({
        where: { id },
        data: { archived: false },
        include: { assignedProvider: true },
      });

      return this.parsePatientData(restoredPatient);
    } catch (error: unknown) {
      this.logger.error(
        'Error restoring patient',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to restore patient');
    }
  }

  async getProfile(userId: number) {
    try {
      this.logger.log(`Getting profile for patient ${userId}`);
      const patient = await this.prisma.patient.findUnique({
        where: { id: userId },
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
      if (!patient) {
        throw new NotFoundException(errorMessages.patients.NOT_FOUND);
      }

      return this.parsePatientData(patient);
    } catch (error: unknown) {
      this.logger.error(
        'Error getting patient profile',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to get patient profile');
    }
  }
}
