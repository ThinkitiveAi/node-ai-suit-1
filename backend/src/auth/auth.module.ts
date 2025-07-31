import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma.service';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
