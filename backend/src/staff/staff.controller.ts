import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StaffService } from './staff.service';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly svc: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'List all active staff' })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Get(':id/slots')
  @ApiOperation({ summary: 'Get available time slots' })
  getSlots(
    @Param('id') staffId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
  ) {
    return this.svc.getAvailableSlots(staffId, date, serviceId);
  }
}
