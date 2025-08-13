/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  AppointmentStatus,
  APPOINTMENT_STATUS_TRANSITIONS,
} from './dto/appointment-status.enum';
import { errorMessages } from '../common/errors/error-messages';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

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

  private isTimeInRange(
    time: string,
    startTime: string,
    endTime: string,
  ): boolean {
    const appointmentTime = new Date(`2000-01-01T${time}:00`);
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return appointmentTime >= start && appointmentTime <= end;
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): boolean {
    const allowedTransitions =
      APPOINTMENT_STATUS_TRANSITIONS[currentStatus as AppointmentStatus] || [];
    return allowedTransitions.includes(newStatus as AppointmentStatus);
  }

  private async checkDuplicateAppointment(
    patientId: number,
    date: Date,
    excludeId?: number,
  ): Promise<boolean> {
    const where: any = {
      patientId,
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingAppointment = await this.prisma.appointment.findFirst({
      where,
    });
    return !!existingAppointment;
  }

  private async validateProviderAvailability(
    providerId: number,
    date: Date,
    time: string,
    locationId?: number,
  ): Promise<void> {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    const where: any = {
      providerId,
      dayOfWeek,
      isActive: true,
    };

    if (locationId) {
      where.locationId = locationId;
    }

    const availabilities = await this.prisma.availability.findMany({ where });

    if (availabilities.length === 0) {
      throw new BadRequestException(
        errorMessages.appointments.PROVIDER_NOT_AVAILABLE,
      );
    }

    // Check if appointment time falls within any availability slot
    const isTimeAvailable = availabilities.some((availability) =>
      this.isTimeInRange(time, availability.startTime, availability.endTime),
    );

    if (!isTimeAvailable) {
      throw new BadRequestException(
        errorMessages.appointments.TIME_OUTSIDE_AVAILABILITY,
      );
    }
  }

  private async validateLocationAssignment(
    providerId: number,
    locationId: number,
  ): Promise<void> {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new BadRequestException(
        errorMessages.appointments.LOCATION_NOT_FOUND,
      );
    }

    if (!location.isActive) {
      throw new BadRequestException(errorMessages.locations.INACTIVE_LOCATION);
    }

    // Check if provider has availability at this location
    const availability = await this.prisma.availability.findFirst({
      where: {
        providerId,
        locationId,
        isActive: true,
      },
    });

    if (!availability) {
      throw new BadRequestException(
        errorMessages.appointments.LOCATION_NOT_ASSIGNED,
      );
    }
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    try {
      this.logger.log('Creating appointment', createAppointmentDto);

      const appointmentDate = new Date(createAppointmentDto.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validate appointment date is not in the past
      if (appointmentDate < today) {
        throw new BadRequestException(errorMessages.appointments.PAST_DATE);
      }

      // Validate time format if provided
      if (
        createAppointmentDto.time &&
        !this.validateTimeFormat(createAppointmentDto.time)
      ) {
        throw new BadRequestException(
          errorMessages.appointments.INVALID_TIME_FORMAT,
        );
      }

      // Validate patient exists and is not archived
      const patient = await this.prisma.patient.findUnique({
        where: { id: createAppointmentDto.patientId },
      });
      if (!patient) {
        throw new BadRequestException(
          errorMessages.appointments.PATIENT_NOT_FOUND,
        );
      }
      if (patient.archived) {
        throw new BadRequestException(
          errorMessages.appointments.ARCHIVED_PATIENT,
        );
      }

      // Validate provider exists and is not archived
      const provider = await this.prisma.provider.findUnique({
        where: { id: createAppointmentDto.practiceUserId },
      });
      if (!provider) {
        throw new BadRequestException(
          errorMessages.appointments.PROVIDER_NOT_FOUND,
        );
      }
      if (provider.archived) {
        throw new BadRequestException(
          errorMessages.appointments.ARCHIVED_PROVIDER,
        );
      }

      // Validate location if provided
      if (createAppointmentDto.locationId) {
        await this.validateLocationAssignment(
          createAppointmentDto.practiceUserId,
          createAppointmentDto.locationId,
        );
      }

      // Check for duplicate appointment on the same date
      const hasDuplicate = await this.checkDuplicateAppointment(
        createAppointmentDto.patientId,
        appointmentDate,
      );
      if (hasDuplicate) {
        throw new BadRequestException(
          errorMessages.appointments.DUPLICATE_APPOINTMENT,
        );
      }

      // Validate provider availability if time is provided
      if (createAppointmentDto.time) {
        await this.validateProviderAvailability(
          createAppointmentDto.practiceUserId,
          appointmentDate,
          createAppointmentDto.time,
          createAppointmentDto.locationId,
        );
      }

      const createdAppointment = await this.prisma.appointment.create({
        data: {
          ...createAppointmentDto,
          date: appointmentDate,
          status: createAppointmentDto.status || AppointmentStatus.SCHEDULED,
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

      return createdAppointment;
    } catch (error: unknown) {
      this.logger.error(
        'Error creating appointment',
        (error as Error).stack || (error as Error).message,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create appointment');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    patientId?: number,
    providerId?: number,
    status?: string,
    date?: string,
  ) {
    try {
      this.logger.log('Fetching appointments with filters', {
        page,
        limit,
        patientId,
        providerId,
        status,
        date,
      });

      const skip = (page - 1) * limit;
      const where: any = {};

      if (patientId) where.patientId = patientId;
      if (providerId) where.practiceUserId = providerId;
      if (status) where.status = status;
      if (date) {
        const appointmentDate = new Date(date);
        where.date = {
          gte: new Date(
            appointmentDate.getFullYear(),
            appointmentDate.getMonth(),
            appointmentDate.getDate(),
          ),
          lt: new Date(
            appointmentDate.getFullYear(),
            appointmentDate.getMonth(),
            appointmentDate.getDate() + 1,
          ),
        };
      }

      const [appointments, total] = await Promise.all([
        this.prisma.appointment.findMany({
          where,
          skip,
          take: limit,
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
          orderBy: { date: 'asc' },
        }),
        this.prisma.appointment.count({ where }),
      ]);

      return {
        data: appointments,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching appointments',
        (error as Error).stack || (error as Error).message,
      );
      throw new InternalServerErrorException('Failed to fetch appointments');
    }
  }

  async findOne(id: number, userId?: number, userRole?: string) {
    try {
      this.logger.log(`Fetching appointment with id ${id}`);

      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
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

      if (!appointment) {
        throw new NotFoundException(errorMessages.appointments.NOT_FOUND);
      }

      // Check access permissions
      if (userId && userRole) {
        if (userRole === 'PATIENT' && appointment.patientId !== userId) {
          throw new ForbiddenException(
            errorMessages.appointments.CANNOT_MODIFY_OTHER_PATIENT,
          );
        }
        if (userRole === 'PROVIDER' && appointment.practiceUserId !== userId) {
          throw new ForbiddenException(
            errorMessages.appointments.CANNOT_MODIFY_OTHER_PROVIDER,
          );
        }
      }

      return appointment;
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching appointment',
        (error as Error).stack || (error as Error).message,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new InternalServerErrorException('Failed to fetch appointment');
    }
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    userId?: number,
    userRole?: string,
  ) {
    try {
      this.logger.log(
        `Updating appointment with id ${id}`,
        updateAppointmentDto,
      );

      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundException(errorMessages.appointments.NOT_FOUND);
      }

      // Check access permissions
      if (userId && userRole) {
        if (userRole === 'PATIENT' && appointment.patientId !== userId) {
          throw new ForbiddenException(
            errorMessages.appointments.CANNOT_MODIFY_OTHER_PATIENT,
          );
        }
        if (userRole === 'PROVIDER' && appointment.practiceUserId !== userId) {
          throw new ForbiddenException(
            errorMessages.appointments.CANNOT_MODIFY_OTHER_PROVIDER,
          );
        }
      }

      // Validate status transition if status is being updated
      if (
        updateAppointmentDto.status &&
        updateAppointmentDto.status !== appointment.status
      ) {
        if (
          !this.validateStatusTransition(
            appointment.status || '',
            updateAppointmentDto.status,
          )
        ) {
          throw new BadRequestException(
            errorMessages.appointments.INVALID_STATUS_TRANSITION,
          );
        }
      }

      // Validate time format if provided
      if (
        updateAppointmentDto.time &&
        !this.validateTimeFormat(updateAppointmentDto.time)
      ) {
        throw new BadRequestException(
          errorMessages.appointments.INVALID_TIME_FORMAT,
        );
      }

      // Validate appointment date is not in the past if being updated
      if (updateAppointmentDto.date) {
        const appointmentDate = new Date(updateAppointmentDto.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
          throw new BadRequestException(errorMessages.appointments.PAST_DATE);
        }
      }

      // Validate location if being updated
      if (updateAppointmentDto.locationId && appointment.practiceUserId) {
        await this.validateLocationAssignment(
          appointment.practiceUserId,
          updateAppointmentDto.locationId,
        );
      }

      // Check for duplicate appointment if date is being updated
      if (updateAppointmentDto.date && appointment.patientId) {
        const appointmentDate = new Date(updateAppointmentDto.date);
        const hasDuplicate = await this.checkDuplicateAppointment(
          appointment.patientId,
          appointmentDate,
          id,
        );
        if (hasDuplicate) {
          throw new BadRequestException(
            errorMessages.appointments.DUPLICATE_APPOINTMENT,
          );
        }
      }

      // Validate provider availability if time is being updated
      if (
        updateAppointmentDto.time &&
        appointment.practiceUserId &&
        appointment.date
      ) {
        const appointmentDate = updateAppointmentDto.date
          ? new Date(updateAppointmentDto.date)
          : appointment.date;
        await this.validateProviderAvailability(
          appointment.practiceUserId,
          appointmentDate,
          updateAppointmentDto.time,
          updateAppointmentDto.locationId ||
            appointment.locationId ||
            undefined,
        );
      }

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id },
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

      return updatedAppointment;
    } catch (error: unknown) {
      this.logger.error(
        'Error updating appointment',
        (error as Error).stack || (error as Error).message,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new InternalServerErrorException('Failed to update appointment');
    }
  }

  async remove(id: number, userId?: number, userRole?: string) {
    try {
      this.logger.log(`Deleting appointment with id ${id}`);

      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundException(errorMessages.appointments.NOT_FOUND);
      }

      // Check access permissions
      if (userId && userRole) {
        if (userRole === 'PATIENT' && appointment.patientId !== userId) {
          throw new ForbiddenException(
            errorMessages.appointments.CANNOT_MODIFY_OTHER_PATIENT,
          );
        }
        if (userRole === 'PROVIDER' && appointment.practiceUserId !== userId) {
          throw new ForbiddenException(
            errorMessages.appointments.CANNOT_MODIFY_OTHER_PROVIDER,
          );
        }
      }

      return this.prisma.appointment.delete({ where: { id } });
    } catch (error: unknown) {
      this.logger.error(
        'Error deleting appointment',
        (error as Error).stack || (error as Error).message,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new InternalServerErrorException('Failed to delete appointment');
    }
  }

  async updateStatus(
    id: number,
    status: AppointmentStatus,
    userId?: number,
    userRole?: string,
  ) {
    try {
      this.logger.log(`Updating appointment status to ${status} for id ${id}`);

      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundException(errorMessages.appointments.NOT_FOUND);
      }

      // Check access permissions
      if (userId && userRole) {
        if (userRole === 'PATIENT' && appointment.patientId !== userId) {
          throw new ForbiddenException(
            errorMessages.appointments.CANNOT_MODIFY_OTHER_PATIENT,
          );
        }
        if (userRole === 'PROVIDER' && appointment.practiceUserId !== userId) {
          throw new ForbiddenException(
            errorMessages.appointments.CANNOT_MODIFY_OTHER_PROVIDER,
          );
        }
      }

      // Validate status transition
      if (!this.validateStatusTransition(appointment.status || '', status)) {
        throw new BadRequestException(
          errorMessages.appointments.INVALID_STATUS_TRANSITION,
        );
      }

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id },
        data: { status },
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

      return updatedAppointment;
    } catch (error: unknown) {
      this.logger.error(
        'Error updating appointment status',
        (error as Error).stack || (error as Error).message,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new InternalServerErrorException(
        'Failed to update appointment status',
      );
    }
  }
}
