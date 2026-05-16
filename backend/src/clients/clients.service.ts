// clients/clients.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const existing = await this.prisma.client.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Phone already registered');
    return this.prisma.client.create({ data: dto });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where:   { id },
      include: { pets: true, preferences: true },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  history(id: string) {
    return this.prisma.appointment.findMany({
      where:   { clientId: id },
      include: { pet: true, staff: true, service: true, review: true },
      orderBy: { startAt: 'desc' },
    });
  }
}

// clients/dto/create-client.dto.ts
// (exported separately but kept in same file for brevity)
export { CreateClientDto } from './dto/create-client.dto';
