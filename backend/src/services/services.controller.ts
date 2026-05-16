// services/services.controller.ts
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';

@ApiTags('services')
@Controller({ path: 'services', version: '1' })
export class ServicesController {
  constructor(private readonly svc: ServicesService) {}

  @Get()    findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }
}
