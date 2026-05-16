// services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      where:   { isActive: true },
      include: { staff: { include: { staff: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const svc = await this.prisma.service.findUnique({
      where:   { id },
      include: { staff: { include: { staff: true } } },
    });
    if (!svc) throw new NotFoundException('Service not found');
    return svc;
  }
}
