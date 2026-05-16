// appointments/appointments.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService }       from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsDto  } from './dto/list-appointments.dto';
import { AppointmentStatus }   from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    // 1. Load service to compute duration + price
    const service = await this.prisma.service.findUniqueOrThrow({
      where: { id: dto.serviceId },
    });

    const pet = await this.prisma.pet.findUniqueOrThrow({
      where: { id: dto.petId },
      include: { client: true },
    });

    // 2. Compute price by pet size
    const coefMap = { SMALL: service.coefSmall, MEDIUM: service.coefMedium, LARGE: service.coefLarge };
    const totalPrice = Math.round(service.basePrice * (coefMap[pet.size] ?? 1) / 10) * 10;

    // 3. Compute end time
    const startAt = new Date(dto.startAt);
    const endAt   = new Date(startAt.getTime() + service.durationMin * 60_000);

    // 4. Conflict check — same staff, overlapping window
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        staffId: dto.staffId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          { startAt: { lt: endAt },   endAt: { gt: startAt } },
        ],
      },
    });
    if (conflict) throw new ConflictException('Time slot already booked');

    // 5. Create
    const appt = await this.prisma.appointment.create({
      data: {
        clientId:   pet.clientId,
        petId:      dto.petId,
        staffId:    dto.staffId,
        serviceId:  dto.serviceId,
        startAt,
        endAt,
        totalPrice,
        notes:      dto.notes,
        status:     'PENDING',
      },
      include: { client: true, pet: true, staff: true, service: true },
    });

    // 6. Schedule notifications (non-blocking)
    this.notifications.scheduleAll(appt).catch(console.error);

    return appt;
  }

  async findAll(query: ListAppointmentsDto) {
    const where: Record<string, unknown> = {};
    if (query.staffId) where.staffId = query.staffId;
    if (query.status)  where.status  = query.status;
    if (query.date) {
      const d     = new Date(query.date);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end   = new Date(d); end.setHours(23,59,59,999);
      where.startAt = { gte: start, lte: end };
    }
    return this.prisma.appointment.findMany({
      where,
      include: { client: true, pet: true, staff: true, service: true },
      orderBy: { startAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { client: true, pet: true, staff: true, service: true, review: true },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    return appt;
  }

  async cancel(id: string, reason?: string) {
    const appt = await this.findOne(id);
    if (['CANCELLED','COMPLETED','NO_SHOW'].includes(appt.status)) {
      throw new ConflictException(`Cannot cancel appointment with status ${appt.status}`);
    }
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED, notes: reason ?? appt.notes },
      include: { client: true, pet: true, staff: true, service: true },
    });
    this.notifications.sendCancellation(updated).catch(console.error);
    return updated;
  }
}
