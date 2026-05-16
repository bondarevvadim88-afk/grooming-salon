import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppointmentsModule } from './appointments/appointments.module';
import { StaffModule }        from './staff/staff.module';
import { ServicesModule }     from './services/services.module';
import { ClientsModule }      from './clients/clients.module';
import { NotificationsModule }from './notifications/notifications.module';
import { PrismaModule }       from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    PrismaModule,
    AppointmentsModule,
    StaffModule,
    ServicesModule,
    ClientsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
