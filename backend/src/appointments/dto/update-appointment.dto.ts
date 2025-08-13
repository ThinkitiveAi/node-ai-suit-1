import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import {
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from './appointment-status.enum';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiPropertyOptional({ 
    example: AppointmentStatus.CONFIRMED,
    enum: AppointmentStatus,
    description: 'New appointment status'
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(AppointmentStatus))
  status?: AppointmentStatus;
} 