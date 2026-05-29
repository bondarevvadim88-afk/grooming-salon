import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly svc: ServicesService) {}

  @Get()
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create service (admin only)' })
  create(@Body() body: {
    name: string; description?: string;
    basePrice: number; durationMin: number;
    coefSmall?: number; coefMedium?: number; coefLarge?: number;
  }) { return this.svc.createService(body); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service (admin only)' })
  update(@Param('id') id: string, @Body() body: {
    name?: string; description?: string;
    basePrice?: number; durationMin?: number;
    coefSmall?: number; coefMedium?: number; coefLarge?: number;
    isActive?: boolean;
  }) { return this.svc.updateService(id, body); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate service (admin only)' })
  remove(@Param('id') id: string) { return this.svc.deactivateService(id); }
}
