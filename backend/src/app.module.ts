import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController }      from './app.controller';
import { AuthModule }         from './auth/auth.module';
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
    AuthModule,
    AppointmentsModule,
    StaffModule,
    ServicesModule,
    ClientsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
