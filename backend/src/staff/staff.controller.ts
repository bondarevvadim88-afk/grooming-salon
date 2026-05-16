// staff/staff.controller.ts
import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StaffService } from './staff.service';

@ApiTags('staff')
@Controller({ path: 'staff', version: '1' })
export class StaffController {
  constructor(private readonly svc: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'List all active staff' })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Get(':id/slots')
  @ApiOperation({ summary: 'Get available time slots for a staff member' })
  getSlots(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Query('date') date: string,         // YYYY-MM-DD
    @Query('serviceId') serviceId: string,
  ) {
    return this.svc.getAvailableSlots(staffId, date, serviceId);
  }
}
