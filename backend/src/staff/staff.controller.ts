import { Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
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
@Put(':id/schedule')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
updateSchedule(
  @Param('id') staffId: string,
  @Body() body: { schedule: Array<{ dayOfWeek: number; isWorking: boolean; startTime: string; endTime: string }> },
  @Request() req: any,
) {
  if (req.user.role === 'MASTER' && req.user.staffId !== staffId) {
    throw new Error('Нет доступа');
  }
  return this.svc.updateSchedule(staffId, body.schedule);
}
}
