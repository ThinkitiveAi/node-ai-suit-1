/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      this.logger.log('Creating role', createRoleDto);

      // Check if role name already exists
      const existingRole = await this.prisma.role.findUnique({
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        throw new BadRequestException('Role with this name already exists');
      }

      return await this.prisma.role.create({
        data: createRoleDto,
      });
    } catch (error) {
      this.logger.error('Error creating role', error.stack || error.message);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create role');
    }
  }

  async findAll(type?: 'STAFF' | 'CLINICIAN') {
    try {
      this.logger.log('Fetching all roles' + (type ? ` of type ${type}` : ''));
      const where = type ? { type } : {};
      return await this.prisma.role.findMany({ where });
    } catch (error) {
      this.logger.error('Error fetching roles', error.stack || error.message);
      throw new InternalServerErrorException('Failed to fetch roles');
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log(`Fetching role with id ${id}`);
      const role = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      return role;
    } catch (error) {
      this.logger.error('Error fetching role', error.stack || error.message);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch role');
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      this.logger.log(`Updating role with id ${id}`, updateRoleDto);

      const role = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // Check if new name conflicts with existing role
      if (updateRoleDto.name) {
        const existingRole = await this.prisma.role.findUnique({
          where: { name: updateRoleDto.name },
        });

        if (existingRole && existingRole.id !== id) {
          throw new BadRequestException('Role with this name already exists');
        }
      }

      return await this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
      });
    } catch (error) {
      this.logger.error('Error updating role', error.stack || error.message);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Failed to update role');
    }
  }
}
