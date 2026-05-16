// staff/staff.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SLOT_INTERVAL_MIN = 30; // slots every 30 minutes

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.staff.findMany({
      where:   { isActive: true },
      include: { services: { include: { service: true } }, workSchedules: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where:   { id },
      include: { services: { include: { service: true } }, workSchedules: true },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async getAvailableSlots(staffId: string, dateStr: string, serviceId: string) {
    const service = await this.prisma.service.findUniqueOrThrow({ where: { id: serviceId } });
    const date    = new Date(dateStr);
    const dow     = date.getDay() === 0 ? 7 : date.getDay(); // ISO: 1=Mon, 7=Sun

    const schedule = await this.prisma.workSchedule.findFirst({
      where: { staffId, dayOfWeek: dow, isWorking: true },
    });
    if (!schedule) return { slots: [] };

    // Existing bookings that day
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);
    const booked   = await this.prisma.appointment.findMany({
      where: {
        staffId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startAt: { gte: dayStart, lte: dayEnd },
      },
      select: { startAt: true, endAt: true },
    });

    // Build slots
    const [sh, sm] = schedule.startTime.split(':').map(Number);
    const [eh, em] = schedule.endTime.split(':').map(Number);
    const workStart = sh * 60 + sm;
    const workEnd   = eh * 60 + em;
    const slots: { startAt: string; available: boolean }[] = [];

    for (let t = workStart; t + service.durationMin <= workEnd; t += SLOT_INTERVAL_MIN) {
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(t / 60), t % 60, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + service.durationMin * 60_000);

      const conflict = booked.some(b =>
        b.startAt.getTime() < slotEnd.getTime() &&
        b.endAt.getTime()   > slotStart.getTime(),
      );
      slots.push({ startAt: slotStart.toISOString(), available: !conflict });
    }

    return { slots };
  }
}
