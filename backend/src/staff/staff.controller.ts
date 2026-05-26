import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Query, Body, UseGuards, Request, ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create staff (admin only)' })
  create(@Body() body: {
    name: string; specialty: string; bio?: string;
    tags?: string[]; schedule?: string;
  }) { return this.svc.createStaff(body); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff (admin only)' })
  update(@Param('id') id: string, @Body() body: {
    name?: string; specialty?: string; bio?: string;
    isActive?: boolean; rating?: number;
  }) { return this.svc.updateStaff(id, body); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate staff (admin only)' })
  remove(@Param('id') id: string) { return this.svc.deactivateStaff(id); }

  @Put(':id/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update work schedule' })
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

  @Put(':id/breaks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update breaks for staff' })
  updateBreaks(
    @Param('id') staffId: string,
    @Body() body: { breaks: Array<{ dayOfWeek: number; startTime: string; endTime: string }> },
    @Request() req: any,
  ) {
    if (req.user.role === 'MASTER' && req.user.staffId !== staffId) {
      throw new ForbiddenException('Нет доступа');
    }
    return this.svc.updateBreaks(staffId, body.breaks || []);
  }

  @Post(':id/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  linkService(@Param('id') staffId: string, @Body() body: { serviceId: string }) {
    return this.svc.linkService(staffId, body.serviceId);
  }

  @Delete(':id/services/:serviceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  unlinkService(@Param('id') staffId: string, @Param('serviceId') serviceId: string) {
    return this.svc.unlinkService(staffId, serviceId);
  }
}
