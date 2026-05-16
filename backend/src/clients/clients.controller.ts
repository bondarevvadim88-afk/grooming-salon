// clients/clients.controller.ts
import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('clients')
@Controller({ path: 'clients', version: '1' })
export class ClientsController {
  constructor(private readonly svc: ClientsService) {}

  @Post()    create(@Body() dto: CreateClientDto) { return this.svc.create(dto); }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Get(':id/appointments')
  history(@Param('id', ParseUUIDPipe) id: string) { return this.svc.history(id); }
}
