// appointments/appointments.controller.ts
import {
  Controller, Get, Post, Patch, Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsDto  } from './dto/list-appointments.dto';

@ApiTags('appointments')
@Controller({ path: 'appointments', version: '1' })
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create appointment' })
  create(@Body() dto: CreateAppointmentDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List appointments (admin)' })
  findAll(@Query() query: ListAppointmentsDto) {
    return this.svc.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    return this.svc.cancel(id, reason);
  }
}
