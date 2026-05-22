import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const existing = await this.prisma.client.findUnique({ where: { phone: dto.phone } });
    if (existing) return existing;
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

  async createPet(clientId: string, body: { name: string; type: string; breed?: string; size: string }) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client not found');
    return this.prisma.pet.create({
      data: { clientId, name: body.name, type: body.type as any, breed: body.breed || null, size: body.size as any },
    });
  }
}