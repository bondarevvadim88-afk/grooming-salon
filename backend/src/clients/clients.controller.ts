import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly svc: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) { return this.svc.create(dto); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Get(':id/appointments')
  history(@Param('id') id: string) { return this.svc.history(id); }

  @Post(':id/pets')
  createPet(
    @Param('id') clientId: string,
    @Body() body: { name: string; type: string; breed?: string; size: string },
  ) {
    return this.svc.createPet(clientId, body);
  }
}