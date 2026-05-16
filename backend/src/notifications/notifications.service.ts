import { Injectable, Logger } from '@nestjs/common';
import { Appointment } from '@prisma/client';

type ApptFull = Appointment & {
  client:  { name: string; phone: string; email?: string | null };
  pet:     { name: string; breed?: string | null };
  staff:   { name: string };
  service: { name: string };
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async scheduleAll(appt: ApptFull): Promise<void> {
    this.logger.log(`Scheduled notifications for appointment ${appt.id}`);
  }

  async sendCancellation(appt: ApptFull): Promise<void> {
    this.logger.log(`Cancellation notification for appointment ${appt.id}`);
  }
}
