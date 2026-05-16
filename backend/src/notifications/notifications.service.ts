// notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { Appointment, NotificationChannel } from '@prisma/client';

type ApptFull = Appointment & {
  client:  { name: string; phone: string; email?: string | null };
  pet:     { name: string; breed?: string | null };
  staff:   { name: string };
  service: { name: string };
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly queue: Queue;

  constructor(private readonly config: ConfigService) {
    const connection = new IORedis({
      host:     config.get('REDIS_HOST', 'localhost'),
      port:     config.get<number>('REDIS_PORT', 6379),
      password: config.get('REDIS_PASSWORD'),
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue('notifications', {
      connection,
      defaultJobOptions: {
        attempts:          3,
        backoff:           { type: 'exponential', delay: 5_000 },
        removeOnComplete:  { age: 86_400 },     // keep 24h
        removeOnFail:      { age: 7 * 86_400 }, // keep 7d
      },
    });
  }

  async scheduleAll(appt: ApptFull): Promise<void> {
    const now     = Date.now();
    const startMs = appt.startAt.getTime();
    const endMs   = appt.endAt.getTime();

    // Immediate confirmation
    await this.queue.add('notify', {
      type:          'BOOKING_CONFIRMED',
      appointmentId: appt.id,
    });

    // Reminder 24h before
    // R6 fix: guard negative delay
    const delay24h = startMs - 24 * 60 * 60 * 1_000 - now;
    if (delay24h > 0) {
      await this.queue.add('notify', {
        type: 'REMINDER_24H', appointmentId: appt.id,
      }, { delay: delay24h });
    }

    // Reminder 2h before
    // R10 fix: guard negative delay
    const delay2h = startMs - 2 * 60 * 60 * 1_000 - now;
    if (delay2h > 0) {
      await this.queue.add('notify', {
        type: 'REMINDER_2H', appointmentId: appt.id,
      }, { delay: delay2h });
    }

    // Review request 3h after completion
    const delayReview = endMs + 3 * 60 * 60 * 1_000 - now;
    if (delayReview > 0) {
      await this.queue.add('notify', {
        type: 'REVIEW_REQUEST', appointmentId: appt.id,
      }, { delay: delayReview });
    }

    this.logger.log(`Scheduled notifications for appointment ${appt.id}`);
  }

  async sendCancellation(appt: ApptFull): Promise<void> {
    await this.queue.add('notify', {
      type:          'BOOKING_CANCELLED',
      appointmentId: appt.id,
    });
  }
}
