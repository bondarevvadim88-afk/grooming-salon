import { Controller, Get, Put, Param, Query, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly svc: StaffService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Get(':id/slots')
  getSlots(
    @Param('id') staffId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
  ) { return this.svc.getAvailableSlots(staffId, date, serviceId); }

  @Put(':id/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff work schedule' })
  updateSchedule(
    @Param('id') staffId: string,
    @Body() body: { schedule: Array<{ dayOfWeek: number; isWorking: boolean; startTime: string; endTime: string }> },
    @Request() req: any,
  ) {
    if (req.user.role === 'MASTER' && req.user.staffId !== staffId) {
      throw new ForbiddenException('Нет доступа');
    }
    return this.svc.updateSchedule(staffId, body.schedule);
  }
}
