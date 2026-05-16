// appointments/dto/list-appointments.dto.ts
import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class ListAppointmentsDto {
  @IsOptional() @IsUUID()     staffId?: string;
  @IsOptional() @IsEnum(AppointmentStatus) status?: AppointmentStatus;
  @IsOptional() @IsDateString() date?: string;  // YYYY-MM-DD
}
