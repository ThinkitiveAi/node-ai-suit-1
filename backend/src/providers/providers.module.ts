import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, PrismaService],
})
export class ProvidersModule {}
