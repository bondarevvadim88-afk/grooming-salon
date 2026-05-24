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

  createService(data: {
    name: string; description?: string;
    basePrice: number; durationMin: number;
    coefSmall?: number; coefMedium?: number; coefLarge?: number;
  }) {
    return this.prisma.service.create({
      data: {
        name:        data.name,
        description: data.description || null,
        basePrice:   data.basePrice,
        durationMin: data.durationMin,
        coefSmall:   data.coefSmall  ?? 0.8,
        coefMedium:  data.coefMedium ?? 1.0,
        coefLarge:   data.coefLarge  ?? 1.5,
      },
    });
  }

  updateService(id: string, data: {
    name?: string; description?: string;
    basePrice?: number; durationMin?: number;
    coefSmall?: number; coefMedium?: number; coefLarge?: number;
    isActive?: boolean;
  }) {
    return this.prisma.service.update({ where: { id }, data });
  }

  deactivateService(id: string) {
    return this.prisma.service.update({ where: { id }, data: { isActive: false } });
  }
}
