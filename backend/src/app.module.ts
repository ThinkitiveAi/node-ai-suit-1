import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { JwtModule } from '@nestjs/jwt';
import { RolesModule } from './roles/roles.module';
import { PatientsModule } from './patients/patients.module';
import { ProvidersModule } from './providers/providers.module';
import { LocationsModule } from './locations/locations.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    AuthModule,
    MiddlewareModule,
    RolesModule,
    PatientsModule,
    ProvidersModule,
    LocationsModule,
    AvailabilityModule,
    AppointmentsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
