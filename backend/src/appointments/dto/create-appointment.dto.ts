// appointments/dto/create-appointment.dto.ts
import { IsUUID, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsUUID()
  staffId: string;

  @ApiProperty()
  @IsUUID()
  petId: string;

  @ApiProperty({ example: '2025-06-15T10:00:00Z' })
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
