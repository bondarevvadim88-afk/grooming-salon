import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

type ApptData = {
  id: string;
  startAt: Date;
  endAt: Date;
  totalPrice: number;
  staffId: string;
  client:  { name: string; phone: string; email?: string | null };
  pet:     { name: string; breed?: string | null };
  staff:   { name: string };
  service: { name: string };
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private mailer: nodemailer.Transporter | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const host = config.get('SMTP_HOST');
    const user = config.get('SMTP_USER');
    const pass = config.get('SMTP_PASS');

    if (host && user && pass) {
      this.mailer = nodemailer.createTransport({
        host,
        port:       Number(config.get('SMTP_PORT') || 587),
        secure:     false,
        requireTLS: true,
        auth: { user, pass },
      });
      this.logger.log('Email transport configured');
    } else {
      this.logger.warn('SMTP not configured — email notifications disabled');
    }
  }

  // ── Public API ───────────────────────────────────────────────────────

  async scheduleAll(appt: ApptData): Promise<void> {
    this.logger.log(`Scheduling notifications for appointment ${appt.id}`);

    await this.sendConfirmation(appt);

    const now      = Date.now();
    const startMs  = new Date(appt.startAt).getTime();
    const delay24h = startMs - 24 * 60 * 60 * 1000 - now;
    const delay2h  = startMs -  2 * 60 * 60 * 1000 - now;

    if (delay24h > 0) {
      setTimeout(() => this.sendReminder24h(appt).catch(console.error), delay24h);
    }
    if (delay2h > 0) {
      setTimeout(() => this.sendReminder2h(appt).catch(console.error), delay2h);
    }
  }

  async sendCancellation(appt: ApptData): Promise<void> {
    const msg = this.buildCancelMsg(appt);
    await this.dispatchAll(appt.client, msg, appt);

    const baseText = `❌ Отменена запись:
Клиент: ${appt.client.name} (${appt.client.phone})
Услуга: ${appt.service.name}
Питомец: ${appt.pet.name}${appt.pet.breed ? ' · ' + appt.pet.breed : ''}
Время: ${this.fmtDate(appt.startAt)} ${this.fmtTime(appt.startAt)}`;

    await this.notifyAdmin(appt, baseText);
    await this.notifyMaster(appt, baseText);
  }

  // ── Channels ─────────────────────────────────────────────────────────

  private async dispatchAll(
    client: { name: string; phone: string; email?: string | null },
    message: { subject: string; text: string; html: string },
    appt: ApptData,
  ) {
    const results = await Promise.allSettled([
      this.sendEmail(client.email, message),
      this.sendSMS(client.phone, message.text),
      this.sendTelegram(message.text),
      this.sendVK(message.text),
      this.sendMAX(message.text),
    ]);
    results.forEach((r, i) => {
      const ch = ['email','sms','telegram','vk','max'][i];
      if (r.status === 'rejected') {
        this.logger.warn(`${ch} failed for appt ${appt.id}: ${r.reason?.message}`);
      }
    });
  }

  // ── Email ─────────────────────────────────────────────────────────────

  private async sendEmail(
    to: string | null | undefined,
    msg: { subject: string; text: string; html: string },
  ) {
    if (!this.mailer || !to) return;
    const from = this.config.get('SMTP_FROM') || this.config.get('SMTP_USER');
    await this.mailer.sendMail({ from, to, subject: msg.subject, text: msg.text, html: msg.html });
    this.logger.log(`Email sent to ${to}`);
  }

  private async notifyAdmin(appt: ApptData, text: string) {
    const adminEmail = this.config.get('ADMIN_EMAIL');
    if (adminEmail) {
      await this.sendEmail(adminEmail, {
        subject: `ГрумПро: ${text.slice(0, 50)}`,
        text,
        html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
      }).catch(e => this.logger.warn('Admin email failed: ' + e.message));
    }

    const token  = this.config.get('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get('TELEGRAM_ADMIN_CHAT_ID');
    if (token && chatId) {
      await this.sendTelegram(text).catch(e => this.logger.warn('Admin telegram failed: ' + e.message));
    }
  }

  private async notifyMaster(appt: ApptData, text: string) {
    try {
      const masterUser = await this.prisma.user.findFirst({
        where: { staffId: appt.staffId, role: 'MASTER' },
      });
      if (!masterUser?.email) return;
      await this.sendEmail(masterUser.email, {
        subject: `ГрумПро: ${text.slice(0, 50)}`,
        text,
        html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
      });
      this.logger.log(`Master notified: ${masterUser.email}`);
    } catch (e: any) {
      this.logger.warn('notifyMaster failed: ' + e.message);
    }
  }

  // ── SMS (SMSC.ru) ────────────────────────────────────────────────────

  private async sendSMS(phone: string, text: string) {
    const apiKey = this.config.get('SMS_API_KEY');
    const sender = this.config.get('SMS_SENDER') || 'GROOMING';
    if (!apiKey) return;

    const clean = phone.replace(/\D/g, '');
    const url   = `https://smsc.ru/sys/send.php?login=${encodeURIComponent(apiKey)}&psw=&phones=${clean}&mes=${encodeURIComponent(text.slice(0, 160))}&sender=${sender}&fmt=3`;
    const res   = await fetch(url);
    const data  = await res.json();
    if (data.error) throw new Error('SMS error: ' + data.error_code);
    this.logger.log(`SMS sent to ${phone}`);
  }

  // ── Telegram ──────────────────────────────────────────────────────────

  private async sendTelegram(text: string) {
    const token  = this.config.get('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get('TELEGRAM_ADMIN_CHAT_ID');
    if (!token || !chatId) return;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error('Telegram error: ' + data.description);
    this.logger.log('Telegram notification sent');
  }

  // ── VK ────────────────────────────────────────────────────────────────

  private async sendVK(text: string) {
    const token   = this.config.get('VK_SERVICE_TOKEN');
    const groupId = this.config.get('VK_ADMIN_USER_ID'); // VK user ID to notify
    if (!token || !groupId) return;

    const url = `https://api.vk.com/method/messages.send`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        user_id:      groupId,
        message:      text,
        access_token: token,
        v:            '5.199',
        random_id:    String(Date.now()),
      }).toString(),
    });
    const data = await res.json();
    if (data.error) throw new Error('VK error: ' + data.error.error_msg);
    this.logger.log('VK notification sent');
  }

  // ── MAX (mail.ru) ─────────────────────────────────────────────────────

  private async sendMAX(text: string) {
    const apiKey = this.config.get('MAX_API_KEY');
    const chatId = this.config.get('MAX_ADMIN_CHAT_ID');
    if (!apiKey || !chatId) return;

    const res = await fetch('https://botapi.max.ru/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error('MAX error: ' + JSON.stringify(data));
    this.logger.log('MAX notification sent');
  }

  // ── Message builders ─────────────────────────────────────────────────

  private buildConfirmMsg(appt: ApptData) {
    const date = this.fmtDate(appt.startAt);
    const time = this.fmtTime(appt.startAt);
    const text = `✅ Запись создана!\n\nУслуга: ${appt.service.name}\nМастер: ${appt.staff.name}\nПитомец: ${appt.pet.name}${appt.pet.breed ? ' (' + appt.pet.breed + ')' : ''}\nДата: ${date} в ${time}\nСтоимость: от ${appt.totalPrice.toLocaleString('ru-RU')} ₽\n\nДо встречи в салоне ГрумПро! 🐾`;
    return {
      subject: `Запись создана — ${date} ${time}`,
      text,
      html: `<div style="font-family:sans-serif;max-width:480px">
        <h2 style="color:#1D9E75">✅ Запись создана!</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 0;color:#6b6b68">Услуга</td><td style="padding:6px 0;font-weight:500">${appt.service.name}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6b68">Мастер</td><td style="padding:6px 0">${appt.staff.name}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6b68">Питомец</td><td style="padding:6px 0">${appt.pet.name}${appt.pet.breed ? ' · ' + appt.pet.breed : ''}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6b68">Дата</td><td style="padding:6px 0">${date} в ${time}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6b68">Стоимость</td><td style="padding:6px 0;color:#1D9E75;font-weight:500">от ${appt.totalPrice.toLocaleString('ru-RU')} ₽</td></tr>
        </table>
        <p style="margin-top:16px;color:#6b6b68;font-size:13px">До встречи в салоне ГрумПро! 🐾</p>
      </div>`,
    };
  }

  private buildReminder24hMsg(appt: ApptData) {
    const time = this.fmtTime(appt.startAt);
    const text = `⏰ Напоминание!\nЗавтра в ${time} — груминг для ${appt.pet.name}\nМастер: ${appt.staff.name}\nСалон ГрумПро`;
    return { subject: `Напоминание — завтра в ${time}`, text, html: `<p>${text.replace(/\n/g,'<br>')}</p>` };
  }

  private buildReminder2hMsg(appt: ApptData) {
    const time = this.fmtTime(appt.startAt);
    const text = `🕐 Через 2 часа груминг ${appt.pet.name}!\nВремя: ${time}\nМастер: ${appt.staff.name}`;
    return { subject: `Напоминание — через 2 часа`, text, html: `<p>${text.replace(/\n/g,'<br>')}</p>` };
  }

  private buildCancelMsg(appt: ApptData) {
    const date = this.fmtDate(appt.startAt);
    const time = this.fmtTime(appt.startAt);
    const text = `❌ Запись отменена\n\n${appt.service.name} — ${date} в ${time}\nЕсли хотите перенести, запишитесь снова.`;
    return { subject: `Запись отменена — ${date}`, text, html: `<p>${text.replace(/\n/g,'<br>')}</p>` };
  }

  private async sendConfirmation(appt: ApptData) {
    const msg = this.buildConfirmMsg(appt);
    await this.dispatchAll(appt.client, msg, appt);

    const notifyText = `🆕 Новая запись!
Клиент: ${appt.client.name} (${appt.client.phone})
Услуга: ${appt.service.name}
Питомец: ${appt.pet.name}${appt.pet.breed ? ' · ' + appt.pet.breed : ''}
Время: ${this.fmtDate(appt.startAt)} ${this.fmtTime(appt.startAt)}
Мастер: ${appt.staff.name}`;

    await this.notifyAdmin(appt, notifyText);
    await this.notifyMaster(appt, notifyText);
  }

  private async sendReminder24h(appt: ApptData) {
    const msg = this.buildReminder24hMsg(appt);
    await this.dispatchAll(appt.client, msg, appt);
  }

  private async sendReminder2h(appt: ApptData) {
    const msg = this.buildReminder2hMsg(appt);
    await this.dispatchAll(appt.client, msg, appt);
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  private fmtDate(d: Date | string) {
    return new Date(d).toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' });
  }
  private fmtTime(d: Date | string) {
    return new Date(d).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
  }
}
