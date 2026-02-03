import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.waitForDb();
    await this.seedAdmin();
  }

  private async waitForDb(retries = 1, delayMs = 1000) {
    for (let i = 1; i <= retries; i++) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        this.logger.log('✅ DB is ready for seed');
        return;
      } catch (err: any) {
        this.logger.warn(`⏳ DB not ready (try ${i}/${retries})... ${err?.code ?? ''}`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw new Error('❌ DB not ready after retries');
  }

  private async seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@system.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const adminExists = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (adminExists) {
      this.logger.log('✅ Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await this.prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        verified: true,
        IsActive: true, // ✅ NOTE: IsActive -> isActive
        firstName: 'System',
        lastName: 'Admin',
      },
    });

    this.logger.warn('🚀 Admin user auto-seeded');
  }
}
