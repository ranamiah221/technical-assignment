import { Module } from '@nestjs/common';
import { AdminSeedService } from './admin-seed.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AdminSeedService],
})
export class SeedModule {}
